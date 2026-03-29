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
import { CourseUnit } from './course-unit.entity';
import { AssignmentContract, AssignmentType } from '@app/contracts';

@Entity('assignments')
@Index('IDX_assignment_course_unit_id', ['courseUnitId'])
@Index('IDX_assignment_order', ['courseUnitId', 'order'])
export class Assignment implements AssignmentContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'course_unit_id' })
  courseUnitId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'smallint',
  })
  type!: AssignmentType;

  @Column({ name: 'max_score' })
  maxScore!: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column()
  order!: number;

  @ManyToOne('CourseUnit', 'assignments')
  courseUnit?: CourseUnit;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}
