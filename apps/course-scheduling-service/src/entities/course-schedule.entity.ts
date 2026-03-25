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
  CourseScheduleContract,
  DayOfWeek,
} from '@app/contracts/course-scheduling/entities/course-schedule.contract';

@Entity('course_schedules')
export class CourseSchedule implements CourseScheduleContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'course_id' })
  courseId!: number;

  @Column({
    type: 'varchar',
    length: 20,
  })
  dayOfWeek!: DayOfWeek;

  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime!: string;

  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime!: string;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}
