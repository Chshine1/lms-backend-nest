import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

export class CourseContract extends BaseEntityContract {
  @Expose()
  name!: string;

  @Expose()
  tenantId!: number;

  @Expose()
  campusId!: number;

  @Expose()
  teachers!: number[];

  @Expose()
  createdBy!: string;
}
