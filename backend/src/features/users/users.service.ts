import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { Order } from '../orders/order.entity';
import { Payment } from '../payments/payment.entity';
import { GetAdminCustomersDto } from './dto/get-admin-customers.dto';
import { ROLE_CODE, STATUS_CODE } from '../../common/utils/constant';

export interface CreateCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
}

/** Order statuses counted as "đã mua" for the totalSpent aggregate — excludes
 * PENDING/AWAITING_PAYMENT (chưa trả tiền), CANCELLED/FAILED (không thành),
 * và REFUNDED (tiền đã hoàn lại). */
const SPENT_ORDER_STATUSES = ['PAID', 'PROCESSING', 'COMPLETED'];

export interface AdminCustomerListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  createdDate: string;
  modifiedDate: string | null;
}

export interface AdminCustomerDetail extends AdminCustomerListItem {
  orderCount: number;
  totalSpent: number;
  latestPayment: {
    id: string;
    paymentCode: string;
    status: string;
    amount: number;
    currency: string;
    createdDate: string;
    paidAt: string | null;
  } | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
  ) {}

  private toAdminCustomerListItem(user: User): AdminCustomerListItem {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status.code,
      createdDate: user.createdDate.toISOString(),
      modifiedDate: user.modifiedDate ? user.modifiedDate.toISOString() : null,
    };
  }

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

  async getAllForAdmin(query: GetAdminCustomersDto) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .where('user.deletedDate IS NULL')
      .andWhere('role.code = :roleCode', { roleCode: ROLE_CODE.CUSTOMER });

    if (query.status) {
      qb.andWhere('status.code = :statusCode', { statusCode: query.status });
    }
    if (query.search) {
      qb.andWhere(
        '(LOWER(user.fullName) LIKE :search OR LOWER(user.email) LIKE :search OR user.phone LIKE :searchRaw)',
        { search: `%${query.search.toLowerCase()}%`, searchRaw: `%${query.search}%` },
      );
    }

    switch (query.sort) {
      case 'oldest':
        qb.orderBy('user.createdDate', 'ASC');
        break;
      case 'name_asc':
        qb.orderBy('user.fullName', 'ASC');
        break;
      case 'name_desc':
        qb.orderBy('user.fullName', 'DESC');
        break;
      default:
        qb.orderBy('user.createdDate', 'DESC');
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: items.map((u) => this.toAdminCustomerListItem(u)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getByIdForAdmin(id: string): Promise<AdminCustomerDetail> {
    const user = await this.userRepo.findOne({
      where: { id, deletedDate: IsNull() },
      relations: ['role', 'status'],
    });
    if (!user || user.role.code !== ROLE_CODE.CUSTOMER) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    const orderStats = await this.orderRepo
      .createQueryBuilder('order')
      .select('COUNT(*)', 'orderCount')
      .addSelect(
        'SUM(CASE WHEN order.status IN (:...spentStatuses) THEN order.totalAmount ELSE 0 END)',
        'totalSpent',
      )
      .where('order.userId = :userId', { userId: id })
      .andWhere('order.deletedDate IS NULL')
      .setParameters({ spentStatuses: SPENT_ORDER_STATUSES })
      .getRawOne<{ orderCount: string; totalSpent: string | null }>();

    const latestPayment = await this.paymentRepo
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .where('order.userId = :userId', { userId: id })
      .orderBy('payment.createdDate', 'DESC')
      .getOne();

    return {
      ...this.toAdminCustomerListItem(user),
      orderCount: Number(orderStats?.orderCount ?? 0),
      totalSpent: Number(orderStats?.totalSpent ?? 0),
      latestPayment: latestPayment
        ? {
            id: latestPayment.id,
            paymentCode: latestPayment.paymentCode,
            status: latestPayment.status,
            amount: Number(latestPayment.amount),
            currency: latestPayment.currency,
            createdDate: latestPayment.createdDate.toISOString(),
            paidAt: latestPayment.paidAt ? latestPayment.paidAt.toISOString() : null,
          }
        : null,
    };
  }
}
