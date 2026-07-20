import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Status } from '../statuses/status.entity';

export interface LocalizedText {
  vi: string;
  en: string;
}

@Entity('categories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-json' })
  name: LocalizedText;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'simple-json', nullable: true })
  description: LocalizedText | null;

  @Column({ name: 'status_id' })
  statusId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
