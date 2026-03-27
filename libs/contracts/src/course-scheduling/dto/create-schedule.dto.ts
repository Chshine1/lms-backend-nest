import { IsDefined, IsEnum, IsNumber, IsString } from 'class-validator';
import { DayOfWeek } from '../entities/index';

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
