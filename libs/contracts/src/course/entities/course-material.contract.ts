import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

export class CourseMaterialContract extends BaseEntityContract {
  @Expose()
  courseUnitId!: number;

  @Expose()
  fileId!: number;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  uploaderId!: number;
}
