import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';
import { CourseContract } from '../../course/entities/course.contract';

export class EnrollmentContract extends BaseEntityContract {
  @Expose()
  studentId!: number;

  @Expose()
  courseId!: number;

  @Expose()
  enrolledAt!: Date;

  @Expose()
  course?: CourseContract;
}
