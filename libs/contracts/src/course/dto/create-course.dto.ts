import {
  IsArray,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  CourseLevel,
  CourseStatus,
  CourseSubject,
  WaitlistStrategy,
} from '../entities/course.contract';

export class CreateCourseDto {
  @IsDefined()
  @IsString()
  name!: string;

  @IsDefined()
  @IsEnum(CourseSubject)
  subject!: CourseSubject;

  @IsDefined()
  @IsEnum(CourseLevel)
  level!: CourseLevel;

  @IsDefined()
  @IsInt()
  @Min(1)
  totalHours!: number;

  @IsDefined()
  @IsInt()
  @Min(1)
  lessonDuration!: number;

  @IsOptional()
  @IsString()
  schedulePattern?: string;

  @IsOptional()
  @IsString()
  fixedTime?: string;

  @IsDefined()
  @IsInt()
  campusId!: number;

  @IsOptional()
  @IsInt()
  classroomId?: number;

  @IsDefined()
  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsEnum(WaitlistStrategy)
  waitlistStrategy?: WaitlistStrategy;

  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  teachers!: number[];

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsDefined()
  @IsString()
  createdBy!: string;
}
