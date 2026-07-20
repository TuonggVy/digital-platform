import { Column } from 'typeorm';

export abstract class BaseEntity {
  @Column({ name: 'created_date', type: 'datetime2', default: () => 'SYSUTCDATETIME()' })
  createdDate: Date;

  @Column({ name: 'modified_date', type: 'datetime2', nullable: true })
  modifiedDate: Date | null;

  @Column({ name: 'deleted_date', type: 'datetime2', nullable: true })
  deletedDate: Date | null;
}
