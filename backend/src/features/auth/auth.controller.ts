import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập',
    description: 'Xác thực tài khoản bằng email + password, trả về access token và refresh token.',
  })
  @ApiBody({ type: LoginDto, description: 'Thông tin đăng nhập' })
  @ApiOkResponse({ description: 'Đăng nhập thành công, trả về accessToken, refreshToken và thông tin user' })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không đúng, hoặc tài khoản không còn hoạt động' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản khách hàng',
    description:
      'Tạo User mới với role CUSTOMER (không thể chọn role khác). Kiểm tra email trùng, ' +
      'hash password bằng bcrypt trước khi lưu. Không trả JWT — client phải tự gọi /auth/login sau khi đăng ký.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công, trả về thông tin User (không có password)' })
  @ApiResponse({ status: 400, description: 'Validation lỗi (email sai định dạng, password < 8 ký tự, phone sai định dạng...)' })
  @ApiResponse({ status: 409, description: 'Email đã được sử dụng' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Yêu cầu đặt lại mật khẩu',
    description:
      'Luôn trả về response trung tính giống nhau dù email tồn tại hay không, để chống dò email ' +
      '(email enumeration). Nếu email hợp lệ và đang ACTIVE: tạo reset token ngẫu nhiên (32 byte, ' +
      'crypto.randomBytes), chỉ lưu SHA-256 hash của token trong DB, token hết hạn sau 30 phút và ' +
      'chỉ dùng được 1 lần. Mọi token cũ chưa dùng của user bị vô hiệu hoá ngay khi tạo token mới. ' +
      'Dự án hiện CHƯA có mail/SMTP infrastructure — ở môi trường KHÔNG PHẢI production (NODE_ENV != production), ' +
      'response kèm thêm field "debugResetUrl" để test được toàn bộ luồng cục bộ. Field này KHÔNG BAO GIỜ ' +
      'xuất hiện khi NODE_ENV=production.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 201,
    description:
      'Luôn trả 201 dù email tồn tại hay không. data: { message, debugResetUrl? } — debugResetUrl chỉ có ở non-production.',
  })
  @ApiResponse({ status: 400, description: 'Email sai định dạng' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'Đặt lại mật khẩu bằng reset token',
    description:
      'Nhận raw token (không phải JWT) lấy từ reset URL. Backend tự hash lại bằng SHA-256 và so khớp ' +
      'với DB. Token phải chưa dùng (usedAt IS NULL) và chưa hết hạn. Sau khi đặt lại thành công: ' +
      'password được hash lại bằng bcrypt, token được đánh dấu đã dùng (không thể tái sử dụng), và ' +
      'refresh token hiện tại của user bị revoke (buộc đăng nhập lại). Không nhận email/userId trong request.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 201, description: 'Đặt lại mật khẩu thành công' })
  @ApiResponse({
    status: 400,
    description: 'Token không hợp lệ, đã hết hạn, đã được dùng, hoặc newPassword < 8 ký tự',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Post('change-password')
  @ApiOperation({
    summary: 'Đổi mật khẩu (yêu cầu đăng nhập)',
    description:
      'User lấy từ JWT access token (@CurrentUser), không nhận userId/email từ client. Xác minh ' +
      'currentPassword bằng bcrypt trước khi đổi. Từ chối nếu newPassword trùng currentPassword. ' +
      'Sau khi đổi thành công: password hash mới được lưu, refresh token hiện tại của user bị revoke ' +
      '(client phải tự xoá token cục bộ và điều hướng về /login — response KHÔNG trả access token mới).',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 201, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({
    status: 400,
    description: 'Mật khẩu hiện tại không đúng, mật khẩu mới trùng mật khẩu cũ, hoặc newPassword < 8 ký tự',
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập / token không hợp lệ' })
  changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  async logout(@CurrentUser() user: CurrentUserPayload) {
    await this.authService.logout(user.id);
    return null;
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.me(user.id);
  }
}
