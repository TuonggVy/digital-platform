import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Order } from '../orders/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentStatus, TERMINAL_PAYMENT_STATUSES } from './enums/payment-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SandboxCompleteDto, SandboxResult } from './dto/sandbox-complete.dto';
import { ROLE_CODE } from '../../common/utils/constant';
import { LoggerService } from '../../common/log_service/logger.service';

/** Order statuses a new Payment attempt is allowed to be created against. */
const PAYABLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.AWAITING_PAYMENT,
  OrderStatus.FAILED,
];

const MAX_PAYMENT_CODE_ATTEMPTS = 5;

export interface PaymentPublicDto {
  id: string;
  paymentCode: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider: string;
  providerTransactionId: string | null;
  failureReason: string | null;
  paidAt: string | null;
  expiredAt: string | null;
  createdDate: string;
  modifiedDate: string | null;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private toPublicPayment(payment: Payment): PaymentPublicDto {
    return {
      id: payment.id,
      paymentCode: payment.paymentCode,
      orderId: payment.orderId,
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      provider: payment.provider,
      providerTransactionId: payment.providerTransactionId,
      failureReason: payment.failureReason,
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
      expiredAt: payment.expiredAt ? payment.expiredAt.toISOString() : null,
      createdDate: payment.createdDate.toISOString(),
      modifiedDate: payment.modifiedDate ? payment.modifiedDate.toISOString() : null,
    };
  }

  private generatePaymentCode(): string {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PAY-${y}${m}${d}-${random}`;
  }

  private isDuplicatePaymentCodeError(error: unknown): boolean {
    const driverError = (error as { driverError?: { number?: number; message?: string } })?.driverError;
    if (!driverError) return false;
    return (
      driverError.number === 2627 ||
      driverError.number === 2601 ||
      (typeof driverError.message === 'string' && driverError.message.includes('UQ_payments_payment_code'))
    );
  }

  private assertSandboxEnabled(): void {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException('Sandbox payment không khả dụng ở môi trường production');
    }
  }

  async createPayment(
    userId: string,
    dto: CreatePaymentDto,
  ): Promise<PaymentPublicDto> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: dto.orderId, deletedDate: IsNull() },
      });
      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }
      if (order.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền thanh toán đơn hàng này');
      }
      if (!PAYABLE_ORDER_STATUSES.includes(order.status)) {
        throw new BadRequestException(
          `Đơn hàng đang ở trạng thái ${order.status}, không thể tạo giao dịch thanh toán mới`,
        );
      }

      const existingSuccess = await manager.findOne(Payment, {
        where: { orderId: order.id, status: PaymentStatus.SUCCEEDED },
      });
      if (existingSuccess) {
        throw new BadRequestException('Đơn hàng đã có giao dịch thanh toán thành công');
      }

      // amount/currency luôn lấy từ Order (source of truth) — client không được quyết định.
      const provider = dto.method === PaymentMethod.SANDBOX ? 'sandbox' : 'manual';

      let savedPayment: Payment | undefined;
      let lastError: unknown;
      for (let attempt = 0; attempt < MAX_PAYMENT_CODE_ATTEMPTS; attempt++) {
        const payment = manager.create(Payment, {
          orderId: order.id,
          paymentCode: this.generatePaymentCode(),
          method: dto.method,
          status: PaymentStatus.PENDING,
          amount: order.totalAmount,
          currency: order.currency,
          provider,
          providerTransactionId: null,
          failureReason: null,
          paidAt: null,
          expiredAt: null,
        });
        try {
          savedPayment = await manager.save(payment);
          break;
        } catch (error) {
          lastError = error;
          if (!this.isDuplicatePaymentCodeError(error)) {
            throw error;
          }
        }
      }
      if (!savedPayment) {
        throw lastError instanceof Error ? lastError : new Error('Không thể sinh mã thanh toán duy nhất');
      }

      order.status = OrderStatus.AWAITING_PAYMENT;
      order.modifiedDate = new Date();
      await manager.save(order);

      this.logger.log(
        `Payment created: ${savedPayment.id} (${savedPayment.paymentCode}) for order ${order.id}`,
        'PaymentsService',
      );
      return this.toPublicPayment(savedPayment);
    });
  }

  async getPaymentsForOrder(
    userId: string,
    userRole: string,
    orderId: string,
  ): Promise<PaymentPublicDto[]> {
    const order = await this.orderRepo.findOne({ where: { id: orderId, deletedDate: IsNull() } });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (userRole !== ROLE_CODE.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem thanh toán của đơn hàng này');
    }

    const payments = await this.paymentRepo.find({
      where: { orderId: order.id },
      order: { createdDate: 'DESC' },
    });
    return payments.map((p) => this.toPublicPayment(p));
  }

  async sandboxComplete(
    userId: string,
    userRole: string,
    paymentId: string,
    dto: SandboxCompleteDto,
  ): Promise<PaymentPublicDto> {
    this.assertSandboxEnabled();

    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, { where: { id: paymentId } });
      if (!payment) {
        throw new NotFoundException('Không tìm thấy giao dịch thanh toán');
      }

      const order = await manager.findOne(Order, { where: { id: payment.orderId } });
      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }
      if (userRole !== ROLE_CODE.ADMIN && order.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền cập nhật thanh toán này');
      }

      if (TERMINAL_PAYMENT_STATUSES.includes(payment.status)) {
        throw new BadRequestException(
          'Giao dịch thanh toán đã ở trạng thái cuối, không thể cập nhật. Vui lòng tạo giao dịch mới.',
        );
      }

      const providerTransactionId = `SANDBOX-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      payment.providerTransactionId = providerTransactionId;
      payment.modifiedDate = new Date();

      if (dto.result === SandboxResult.SUCCESS) {
        if (order.status === OrderStatus.PAID) {
          throw new ConflictException('Đơn hàng đã được thanh toán bởi một giao dịch khác');
        }
        if ([OrderStatus.CANCELLED, OrderStatus.COMPLETED, OrderStatus.REFUNDED].includes(order.status)) {
          throw new BadRequestException(
            `Đơn hàng đang ở trạng thái ${order.status}, không thể xác nhận thanh toán`,
          );
        }
        payment.status = PaymentStatus.SUCCEEDED;
        payment.paidAt = new Date();
        order.status = OrderStatus.PAID;
        order.modifiedDate = new Date();
        await manager.save(order);
      } else if (dto.result === SandboxResult.FAILURE) {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = 'Sandbox: giao dịch thất bại (giả lập)';
        // Order giữ nguyên AWAITING_PAYMENT — không tự động đổi sang FAILED.
      } else {
        payment.status = PaymentStatus.CANCELLED;
        // Order giữ nguyên AWAITING_PAYMENT.
      }

      const saved = await manager.save(payment);
      this.logger.log(
        `Payment ${saved.id} (${saved.paymentCode}) sandbox result: ${dto.result} -> ${saved.status}`,
        'PaymentsService',
      );
      return this.toPublicPayment(saved);
    });
  }
}
