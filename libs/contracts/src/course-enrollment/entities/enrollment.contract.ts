import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export class EnrollmentContract extends BaseEntityContract {
  @Expose()
  studentId!: number;

  @Expose()
  courseId!: number;

  @Expose()
  enrolledAt!: Date;
}
