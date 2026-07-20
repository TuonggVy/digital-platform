import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../users/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './enums/order-status.enum';

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_code', type: 'nvarchar', length: 30, unique: true })
  orderCode: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'nvarchar', length: 30, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ type: 'nvarchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ name: 'customer_name', type: 'nvarchar', length: 255 })
  customerName: string;

  @Column({ name: 'customer_email', type: 'nvarchar', length: 255 })
  customerEmail: string;

  @Column({ name: 'customer_phone', type: 'nvarchar', length: 20 })
  customerPhone: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  note: string | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
