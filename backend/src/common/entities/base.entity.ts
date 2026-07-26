import { Column } from 'typeorm';

export abstract class BaseEntity {
  @Column({ name: 'created_date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ name: 'modified_date', type: 'timestamptz', nullable: true })
  modifiedDate: Date | null;

  @Column({ name: 'deleted_date', type: 'timestamptz', nullable: true })
  deletedDate: Date | null;
}
