import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import {
  CourseContract,
  CourseLevel,
  CourseStatus,
  CourseSubject,
  WaitlistStrategy,
} from '@app/contracts';

@Entity('courses')
export class Course implements CourseContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: 'smallint',
  })
  subject!: CourseSubject;

  @Column({
    type: 'smallint',
  })
  level!: CourseLevel;

  @Column({ name: 'total_hours' })
  totalHours!: number;

  @Column({ name: 'lesson_duration' })
  lessonDuration!: number;

  @Column({ name: 'schedule_pattern' })
  schedulePattern!: string;

  @Column({ name: 'fixed_time' })
  fixedTime!: string;

  @Column({ name: 'campus_id' })
  campusId!: number;

  @Column({ name: 'classroom_id', nullable: true })
  classroomId?: number;

  @Column()
  capacity!: number;

  @Column({
    name: 'waitlist_strategy',
    type: 'smallint',
    default: WaitlistStrategy.DISABLED,
  })
  waitlistStrategy!: WaitlistStrategy;

  @Column({ name: 'teacher_id' })
  teacherId!: string;

  @Column({
    type: 'smallint',
    default: CourseStatus.DRAFT,
  })
  status!: CourseStatus;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}
