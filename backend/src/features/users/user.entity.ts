import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/entities/base.entity';
import { Role } from '../roles/role.entity';
import { Status } from '../statuses/status.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'nvarchar', length: 255 })
  fullName: string;

  @Column({ type: 'nvarchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  company: string | null;

  @Column({ name: 'tax_code', type: 'nvarchar', length: 50, nullable: true })
  taxCode: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  address: string | null;

  @Column({ name: 'password_hash', type: 'nvarchar', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'status_id' })
  statusId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ name: 'refresh_token_hash', type: 'nvarchar', length: 255, nullable: true })
  @Exclude()
  refreshTokenHash: string | null;

  @Column({ name: 'refresh_token_expires_at', type: 'datetime2', nullable: true })
  @Exclude()
  refreshTokenExpiresAt: Date | null;
}
