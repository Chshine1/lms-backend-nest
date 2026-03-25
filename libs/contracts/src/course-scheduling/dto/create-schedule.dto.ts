import { IsDefined, IsNumber, IsEnum, IsString } from 'class-validator';
import { DayOfWeek } from '../entities/course-schedule.contract';

export class CreateScheduleDto {
  @IsDefined()
  @IsNumber()
  courseId!: number;

  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsDefined()
  @IsString()
  startTime!: string;

  @IsDefined()
  @IsString()
  endTime!: string;

  @IsDefined()
  @IsString()
  location!: string;
}
