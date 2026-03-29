import { Column, Entity } from 'typeorm';
import { BaseEntity, CourseContract } from '@app/contracts';

@Entity('courses')
export class Course extends BaseEntity implements CourseContract {
  @Column()
  name!: string;

  @Column({ name: 'tenant_id' })
  tenantId!: number;

  @Column({ name: 'campus_id' })
  campusId!: number;

  @Column({ type: 'int', array: true, default: '{}' })
  teachers!: number[];

  @Column({ name: 'created_by' })
  createdBy!: string;
}
