import { IsEnum, IsString, IsOptional } from 'class-validator';
import { DayOfWeek } from '../entities/course-schedule.contract';

export class UpdateScheduleDto {
  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
