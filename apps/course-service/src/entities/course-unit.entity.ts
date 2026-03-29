import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { CourseUnitContract } from '@app/contracts';

@Entity('course_units')
@Index('IDX_course_unit_course_id', ['courseId'])
@Index('IDX_course_unit_order', ['courseId', 'order'])
export class CourseUnit implements CourseUnitContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'course_id' })
  courseId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  order!: number;

  @ManyToOne('Course', 'units')
  course?: Course;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}
