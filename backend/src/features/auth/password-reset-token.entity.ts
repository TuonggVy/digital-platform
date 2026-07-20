import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** SHA-256 hex digest of the raw reset token — raw token is never persisted. */
  @Column({ name: 'token_hash', type: 'nvarchar', length: 64 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'datetime2' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'datetime2', nullable: true })
  usedAt: Date | null;

  @Column({ name: 'created_date', type: 'datetime2', default: () => 'SYSUTCDATETIME()' })
  createdDate: Date;
}
