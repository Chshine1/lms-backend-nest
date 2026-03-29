import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

export class CourseUnitContract extends BaseEntityContract {
  @Expose()
  courseId!: number;

  @Expose()
  title!: string;

  @Expose()
  description?: string;

  @Expose()
  order!: number;
}
