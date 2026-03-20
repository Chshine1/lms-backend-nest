import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export class CourseVideoContract extends BaseEntityContract {
  @Expose()
  courseId!: number;

  @Expose()
  chapterName!: string;

  @Expose()
  videoUrl!: string;

  @Expose()
  unlockCondition!: string;

  @Expose()
  validityPeriod!: Date;

  @Expose()
  enableDrm!: boolean;

  @Expose()
  sortOrder!: number;

  @Expose()
  uploaderId!: string;
}
