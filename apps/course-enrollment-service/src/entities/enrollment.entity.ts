import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { EnrollmentContract } from '@app/contracts/course-enrollment/entities/enrollment.contract';

@Entity('enrollments')
@Index(['studentId', 'courseId'], { unique: true })
export class Enrollment implements EnrollmentContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'student_id' })
  studentId!: number;

  @Column({ name: 'course_id' })
  courseId!: number;

  @Column({
    name: 'enrolled_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  enrolledAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}
