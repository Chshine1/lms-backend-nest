import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export enum CourseSubject {
  ENGLISH = 1,
  MATH = 2,
  SCIENCE = 3,
  HISTORY = 4,
  ART = 5,
  MUSIC = 6,
  PHYSICAL_EDUCATION = 7,
  COMPUTER_SCIENCE = 8,
}

export enum CourseLevel {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
}

export enum CourseStatus {
  DRAFT = 1,
  PUBLISHED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
}

export enum WaitlistStrategy {
  DISABLED = 0,
  ENABLED = 1,
}

export class CourseContract extends BaseEntityContract {
  @Expose()
  name!: string;

  @Expose()
  subject!: CourseSubject;

  @Expose()
  level!: CourseLevel;

  @Expose()
  totalHours!: number;

  @Expose()
  lessonDuration!: number;

  @Expose()
  schedulePattern!: string;

  @Expose()
  fixedTime!: string;

  @Expose()
  campusId!: number;

  @Expose()
  classroomId?: number;

  @Expose()
  capacity!: number;

  @Expose()
  waitlistStrategy!: WaitlistStrategy;

  @Expose()
  teacherId!: string;

  @Expose()
  status!: CourseStatus;

  @Expose()
  createdBy!: string;
}
