import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../orders/order.entity';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentStatus } from './enums/payment-status.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'payment_code', type: 'nvarchar', length: 30, unique: true })
  paymentCode: string;

  @Column({ type: 'nvarchar', length: 30 })
  method: PaymentMethod;

  @Column({ type: 'nvarchar', length: 30, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'nvarchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ type: 'nvarchar', length: 50 })
  provider: string;

  @Column({ name: 'provider_transaction_id', type: 'nvarchar', length: 100, nullable: true })
  providerTransactionId: string | null;

  @Column({ name: 'failure_reason', type: 'nvarchar', length: 500, nullable: true })
  failureReason: string | null;

  @Column({ name: 'paid_at', type: 'datetime2', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'expired_at', type: 'datetime2', nullable: true })
  expiredAt: Date | null;

  @Column({ name: 'created_date', type: 'datetime2', default: () => 'SYSUTCDATETIME()' })
  createdDate: Date;

  @Column({ name: 'modified_date', type: 'datetime2', nullable: true })
  modifiedDate: Date | null;
}
