import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export class CourseScheduleContract extends BaseEntityContract {
  @Expose()
  courseId!: number;

  @Expose()
  dayOfWeek!: DayOfWeek;

  @Expose()
  startTime!: string;

  @Expose()
  endTime!: string;

  @Expose()
  location!: string;
}
