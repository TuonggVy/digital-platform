import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetMyOrdersDto } from './dto/get-my-orders.dto';
import { GetAdminOrdersDto } from './dto/get-admin-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CANCELLABLE_ORDER_STATUSES, OrderStatus } from './enums/order-status.enum';
import { STATUS_CODE } from '../../common/utils/constant';
import { LoggerService } from '../../common/log_service/logger.service';

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED, OrderStatus.FAILED],
  [OrderStatus.AWAITING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.FAILED],
  [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.REFUNDED],
  [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED, OrderStatus.FAILED],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.FAILED]: [OrderStatus.AWAITING_PAYMENT],
  [OrderStatus.REFUNDED]: [],
};

const MAX_ORDER_CODE_ATTEMPTS = 5;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
  ) {}

  private generateOrderCode(): string {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${y}${m}${d}-${random}`;
  }

  private isDuplicateOrderCodeError(error: unknown): boolean {
    const driverError = (error as { driverError?: { number?: number; message?: string } })?.driverError;
    if (!driverError) return false;
    return (
      driverError.number === 2627 ||
      driverError.number === 2601 ||
      (typeof driverError.message === 'string' && driverError.message.includes('UQ_orders_order_code'))
    );
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId, deletedDate: IsNull() } });
      if (!user || user.statusId !== STATUS_CODE.ACTIVE) {
        throw new BadRequestException('Tài khoản không tồn tại hoặc không còn hoạt động');
      }

      const productIds = [...new Set(dto.items.map((item) => item.productId))];
      const products = await manager.find(Product, {
        where: { id: In(productIds), deletedDate: IsNull() },
        relations: ['category'],
      });
      const productById = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const itemsToCreate: Partial<OrderItem>[] = [];

      for (const itemDto of dto.items) {
        const product = productById.get(itemDto.productId);
        if (!product) {
          throw new BadRequestException(`Sản phẩm không tồn tại: ${itemDto.productId}`);
        }
        if (product.statusId !== STATUS_CODE.ACTIVE) {
          throw new BadRequestException(`Sản phẩm không khả dụng: ${product.slug}`);
        }

        const hasPackages = Boolean(product.packages?.length);
        let unitPrice: number;
        let packageName: Product['packages'][number]['name'] | null = null;
        let resolvedPackageId: string | null = null;

        if (hasPackages) {
          if (!itemDto.packageId) {
            throw new BadRequestException(`Sản phẩm ${product.slug} yêu cầu chọn gói (packageId)`);
          }
          const pkg = product.packages.find((p) => p.id === itemDto.packageId);
          if (!pkg) {
            throw new BadRequestException(`Gói sản phẩm không tồn tại: ${itemDto.packageId}`);
          }
          unitPrice = Number(pkg.price);
          packageName = pkg.name;
          resolvedPackageId = itemDto.packageId;
        } else {
          unitPrice = Number(product.startingPrice);
        }

        const totalPrice = roundMoney(unitPrice * itemDto.quantity);
        subtotal = roundMoney(subtotal + totalPrice);

        itemsToCreate.push({
          productId: product.id,
          productName: product.name,
          productType: product.category?.code ?? product.subCategory,
          packageId: resolvedPackageId,
          packageName,
          unitPrice,
          quantity: itemDto.quantity,
          totalPrice,
        });
      }

      const discountAmount = 0;
      const taxAmount = 0;
      const totalAmount = roundMoney(subtotal - discountAmount + taxAmount);

      let savedOrder: Order | undefined;
      let lastError: unknown;
      for (let attempt = 0; attempt < MAX_ORDER_CODE_ATTEMPTS; attempt++) {
        const order = manager.create(Order, {
          orderCode: this.generateOrderCode(),
          userId,
          status: OrderStatus.PENDING,
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
          currency: 'VND',
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          note: dto.note ?? null,
        });
        try {
          savedOrder = await manager.save(order);
          break;
        } catch (error) {
          lastError = error;
          if (!this.isDuplicateOrderCodeError(error)) {
            throw error;
          }
        }
      }
      if (!savedOrder) {
        throw lastError instanceof Error ? lastError : new Error('Không thể sinh mã đơn hàng duy nhất');
      }

      const items = await manager.save(
        itemsToCreate.map((item) => manager.create(OrderItem, { ...item, orderId: savedOrder!.id })),
      );

      this.logger.log(`Order created: ${savedOrder.id} (${savedOrder.orderCode})`, 'OrdersService');
      savedOrder.items = items;
      return savedOrder;
    });
  }

  async getMyOrders(userId: string, query: GetMyOrdersDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await this.orderRepo.findAndCount({
      where: { userId, deletedDate: IsNull() },
      order: { createdDate: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
  }

  async getOrderDetail(userId: string, id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, userId, deletedDate: IsNull() },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async cancelOrder(userId: string, id: string): Promise<Order> {
    const order = await this.getOrderDetail(userId, id);
    if (!CANCELLABLE_ORDER_STATUSES.includes(order.status)) {
      throw new BadRequestException('Đơn hàng đã thanh toán hoặc không thể huỷ');
    }
    order.status = OrderStatus.CANCELLED;
    order.modifiedDate = new Date();
    const saved = await this.orderRepo.save(order);
    this.logger.log(`Order cancelled: ${id}`, 'OrdersService');
    return saved;
  }

  async getAllForAdmin(query: GetAdminOrdersDto) {
    const qb = this.orderRepo.createQueryBuilder('order').where('order.deletedDate IS NULL');

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }
    if (query.search) {
      qb.andWhere(
        '(LOWER(order.orderCode) LIKE :search OR LOWER(order.customerName) LIKE :search OR LOWER(order.customerEmail) LIKE :search OR order.customerPhone LIKE :searchRaw)',
        { search: `%${query.search.toLowerCase()}%`, searchRaw: `%${query.search}%` },
      );
    }

    switch (query.sort) {
      case 'oldest':
        qb.orderBy('order.createdDate', 'ASC');
        break;
      case 'total_asc':
        qb.orderBy('order.totalAmount', 'ASC');
        break;
      case 'total_desc':
        qb.orderBy('order.totalAmount', 'DESC');
        break;
      default:
        qb.orderBy('order.createdDate', 'DESC');
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
  }

  async getByIdForAdmin(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id, deletedDate: IsNull() },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.getByIdForAdmin(id);
    const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${order.status} sang ${dto.status}. ` +
          (allowedNext.length
            ? `Trạng thái hợp lệ tiếp theo: ${allowedNext.join(', ')}`
            : 'Đây là trạng thái cuối, không thể chuyển tiếp'),
      );
    }
    const previousStatus = order.status;
    order.status = dto.status;
    order.modifiedDate = new Date();
    const saved = await this.orderRepo.save(order);
    this.logger.log(`Order status updated: ${id} ${previousStatus} -> ${dto.status}`, 'OrdersService');
    return saved;
  }
}
