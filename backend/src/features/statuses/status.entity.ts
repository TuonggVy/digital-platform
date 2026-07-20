import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('status')
export class Status extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 50 })
  code: string;

  @Column({ type: 'nvarchar', length: 100 })
  name: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  description: string | null;
}
