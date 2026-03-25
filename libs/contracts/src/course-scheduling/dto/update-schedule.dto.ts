import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DayOfWeek } from '../entities';

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
