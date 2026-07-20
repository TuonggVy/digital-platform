import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Status } from '../statuses/status.entity';
import { Category, LocalizedText } from '../categories/category.entity';

export type BillingCycle = 'monthly' | 'yearly' | 'one_time';

export interface CloudSpec {
  regions: string[];
  cpu: string;
  ram: string;
  ssd: string;
  bandwidth: string;
  os: string[];
}

export interface KasperskySpec {
  devices: number;
  duration: string;
  userType: 'personal' | 'family' | 'business';
  supportedOS: string[];
}

export interface EsimSpec {
  country: LocalizedText;
  countryCode: string;
  region: 'asia' | 'europe' | 'north-america' | 'global';
  dataAmount: string;
  isUnlimited: boolean;
  days: number;
  hotspot: boolean;
  networkType: '4G' | '4G/5G';
  coveredCountries?: string[];
}

export interface ProductPackage {
  id: string;
  name: LocalizedText;
  price: number;
  billingCycle: BillingCycle;
  isPopular?: boolean;
  cloud?: CloudSpec;
  kaspersky?: KasperskySpec;
  esim?: EsimSpec;
}

export interface ProductFaq {
  question: LocalizedText;
  answer: LocalizedText;
}

/** `subCategory` mirrors the FE `Product.subCategory` string (e.g. 'cloud-server', 'standard', 'esim-japan-5gb'). */
@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'sub_category', type: 'nvarchar', length: 100 })
  subCategory: string;

  @Column({ type: 'nvarchar', length: 150, unique: true })
  slug: string;

  @Column({ type: 'nvarchar', length: 100, unique: true, nullable: true })
  sku: string | null;

  @Column({ type: 'simple-json' })
  name: LocalizedText;

  @Column({ name: 'short_description', type: 'simple-json', nullable: true })
  shortDescription: LocalizedText | null;

  @Column({ type: 'simple-json', nullable: true })
  description: LocalizedText | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  icon: string | null;

  @Column({ type: 'simple-json', nullable: true })
  badge: LocalizedText | null;

  @Column({ name: 'starting_price', type: 'decimal', precision: 18, scale: 2 })
  startingPrice: number;

  @Column({ type: 'nvarchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ name: 'billing_cycles', type: 'simple-json' })
  billingCycles: BillingCycle[];

  @Column({ type: 'simple-json', nullable: true })
  features: LocalizedText[];

  @Column({ type: 'simple-json', nullable: true })
  benefits: LocalizedText[];

  @Column({ name: 'how_it_works', type: 'simple-json', nullable: true })
  howItWorks: LocalizedText[];

  @Column({ name: 'suitable_for', type: 'simple-json', nullable: true })
  suitableFor: LocalizedText[];

  @Column({ type: 'simple-json', nullable: true })
  faqs: ProductFaq[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({ name: 'is_featured', type: 'bit', default: false })
  isFeatured: boolean;

  @Column({ name: 'status_id' })
  statusId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ type: 'simple-json', default: '[]' })
  packages: ProductPackage[];

  @Column({ name: 'related_product_ids', type: 'simple-json', default: '[]' })
  relatedProductIds: string[];
}
