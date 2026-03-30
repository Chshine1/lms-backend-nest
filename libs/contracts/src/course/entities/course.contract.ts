import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

export class CourseContract extends BaseEntityContract {
  @Expose()
  name!: string;

  @Expose()
  description!: string;

  @Expose()
  tenantId!: number;

  @Expose()
  teachers!: number[];

  @Expose()
  createdBy!: number;
}
