import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../users/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 50 })
  code: string;

  @Column({ type: 'nvarchar', length: 100 })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
