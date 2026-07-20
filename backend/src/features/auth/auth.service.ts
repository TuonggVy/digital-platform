import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoggerService } from '../../common/log_service/logger.service';
import { STATUS_CODE } from '../../common/utils/constant';

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  company: string | null;
  taxCode: string | null;
  address: string | null;
}

// Response luôn giống nhau dù email tồn tại hay không — chống dò email (enumeration).
const FORGOT_PASSWORD_NEUTRAL_MESSAGE =
  'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.';
const RESET_TOKEN_INVALID_MESSAGE = 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn';
const RESET_TOKEN_TTL_MINUTES = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private hashResetToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.code,
      phone: user.phone,
      company: user.company,
      taxCode: user.taxCode,
      address: user.address,
    };
  }

  private signAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role.code },
      {
        secret: this.config.get<string>('VTC_JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      },
    );
  }

  private signRefreshToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      },
    );
  }

  private async issueTokens(user: User) {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.usersService.setRefreshToken(user.id, refreshTokenHash, expiresAt);
    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.statusId !== STATUS_CODE.ACTIVE) {
      this.logger.warn(`Login failed (not found/inactive): ${email}`, 'AuthService');
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Login failed (wrong password): ${email}`, 'AuthService');
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const tokens = await this.issueTokens(user);
    this.logger.log(`Login success: ${email}`, 'AuthService');
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    if (user.refreshTokenExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async register(dto: RegisterDto): Promise<PublicUser> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      this.logger.warn(`Register failed (email exists): ${dto.email}`, 'AuthService');
      throw new ConflictException('Email này đã được sử dụng');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createCustomer({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
    });
    this.logger.log(`Register success: ${dto.email}`, 'AuthService');
    return this.toPublicUser(user);
  }

  async forgotPassword(rawEmail: string): Promise<{ message: string; debugResetUrl?: string }> {
    const email = rawEmail.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user || user.statusId !== STATUS_CODE.ACTIVE) {
      // Không log là "not found" ra response — chỉ ghi log nội bộ để điều tra, response vẫn trung tính.
      this.logger.warn(`Forgot-password: email không tồn tại hoặc không active (${email})`, 'AuthService');
      return { message: FORGOT_PASSWORD_NEUTRAL_MESSAGE };
    }

    // Vô hiệu hoá mọi reset token cũ chưa dùng của user trước khi phát hành token mới —
    // đảm bảo chỉ token mới nhất còn hiệu lực (Case 8).
    await this.resetTokenRepo.update({ userId: user.id, usedAt: IsNull() }, { usedAt: new Date() });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);

    await this.resetTokenRepo.save(
      this.resetTokenRepo.create({ userId: user.id, tokenHash, expiresAt, usedAt: null }),
    );

    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    // Dự án chưa có mail/SMTP infrastructure — trong development/test, log rõ URL ra
    // console/file log và trả kèm trong response để test được luồng đầy đủ mà không
    // cần mail server thật. Guard theo NODE_ENV để KHÔNG BAO GIỜ lộ raw token ở production.
    if (this.config.get<string>('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV ONLY] Reset password URL cho ${email}: ${resetUrl}`, 'AuthService');
      return { message: FORGOT_PASSWORD_NEUTRAL_MESSAGE, debugResetUrl: resetUrl };
    }

    this.logger.log(`Forgot-password: đã tạo reset token cho user ${user.id}`, 'AuthService');
    return { message: FORGOT_PASSWORD_NEUTRAL_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.hashResetToken(dto.token);
    const resetToken = await this.resetTokenRepo.findOne({ where: { tokenHash } });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(RESET_TOKEN_INVALID_MESSAGE);
    }

    const user = await this.usersService.findById(resetToken.userId);
    if (!user || user.statusId !== STATUS_CODE.ACTIVE) {
      throw new BadRequestException(RESET_TOKEN_INVALID_MESSAGE);
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    // Transaction: cập nhật password + revoke refresh token hiện tại (buộc mọi phiên
    // đăng nhập cũ phải login lại) + đánh dấu token đã dùng phải cùng thành công hoặc
    // cùng rollback — tránh trường hợp token bị đánh dấu "used" nhưng password chưa đổi.
    // Giới hạn đã biết: chỉ có 1 refresh token/user trong kiến trúc hiện tại (không có
    // bảng session riêng theo thiết bị) nên đây là revoke toàn bộ, không theo từng thiết bị.
    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, user.id, {
        passwordHash,
        modifiedDate: new Date(),
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      });
      await manager.update(PasswordResetToken, resetToken.id, { usedAt: new Date() });
    });

    this.logger.log(`Reset password thành công: user ${user.id}`, 'AuthService');
    return { message: 'Đặt lại mật khẩu thành công.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);
    if (!user || user.statusId !== STATUS_CODE.ACTIVE) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc không còn hoạt động');
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      this.logger.warn(`Change-password: sai mật khẩu hiện tại (user ${userId})`, 'AuthService');
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const isSameAsCurrent = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (isSameAsCurrent) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    // Cùng 1 câu UPDATE cho cả password mới + revoke refresh token — đã atomic tự
    // nhiên (1 statement, 1 row), không cần bọc DataSource.transaction() riêng như
    // resetPassword (nơi có 2 entity khác nhau — User và PasswordResetToken — cần
    // đồng bộ commit/rollback).
    await this.usersService.updatePasswordAndRevokeRefreshToken(user.id, passwordHash);

    this.logger.log(`Change password thành công: user ${user.id}`, 'AuthService');
    return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshToken(userId, null, null);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    return this.toPublicUser(user);
  }
}
