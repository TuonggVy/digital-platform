import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { ROLE_CODE, STATUS_CODE } from '../../common/utils/constant';

export interface CreateCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase(), deletedDate: IsNull() },
      relations: ['role', 'status'],
    });
  }

  async createCustomer(input: CreateCustomerInput): Promise<User> {
    const customerRole = await this.roleRepo.findOne({ where: { code: ROLE_CODE.CUSTOMER } });
    if (!customerRole) {
      throw new InternalServerErrorException('Role CUSTOMER chưa được khởi tạo trong hệ thống');
    }
    const created = this.userRepo.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash: input.passwordHash,
      roleId: customerRole.id,
      statusId: STATUS_CODE.ACTIVE,
    });
    const saved = await this.userRepo.save(created);
    return this.findById(saved.id) as Promise<User>;
  }

  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id, deletedDate: IsNull() },
      relations: ['role', 'status'],
    });
  }

  async setRefreshToken(userId: string, hash: string | null, expiresAt: Date | null): Promise<void> {
    await this.userRepo.update(userId, {
      refreshTokenHash: hash,
      refreshTokenExpiresAt: expiresAt,
    });
  }

  /** Single UPDATE statement — already atomic on its own, no separate transaction needed. */
  async updatePasswordAndRevokeRefreshToken(userId: string, passwordHash: string): Promise<void> {
    await this.userRepo.update(userId, {
      passwordHash,
      modifiedDate: new Date(),
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
  }
}
