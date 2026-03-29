import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  CourseLevel,
  CourseStatus,
  CourseSubject,
  WaitlistStrategy,
} from '../entities/course.contract';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CourseSubject)
  subject?: CourseSubject;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsInt()
  totalHours?: number;

  @IsOptional()
  @IsInt()
  lessonDuration?: number;

  @IsOptional()
  @IsString()
  schedulePattern?: string;

  @IsOptional()
  @IsString()
  fixedTime?: string;

  @IsOptional()
  @IsInt()
  campusId?: number;

  @IsOptional()
  @IsInt()
  classroomId?: number;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsEnum(WaitlistStrategy)
  waitlistStrategy?: WaitlistStrategy;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  teachers?: number[];

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
