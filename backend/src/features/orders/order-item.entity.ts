import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { LocalizedText } from '../categories/category.entity';

/**
 * Immutable purchase-time snapshot — never updated or soft-deleted on its own,
 * it lives/dies with its parent Order. Product name/type/package/price are
 * copied here so later edits or deletion of the Product don't rewrite history.
 */
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_name', type: 'simple-json' })
  productName: LocalizedText;

  @Column({ name: 'product_type', type: 'nvarchar', length: 50 })
  productType: string;

  @Column({ name: 'package_id', type: 'nvarchar', length: 100, nullable: true })
  packageId: string | null;

  @Column({ name: 'package_name', type: 'simple-json', nullable: true })
  packageName: LocalizedText | null;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 18, scale: 2 })
  totalPrice: number;

  @Column({ name: 'created_date', type: 'datetime2', default: () => 'SYSUTCDATETIME()' })
  createdDate: Date;
}
