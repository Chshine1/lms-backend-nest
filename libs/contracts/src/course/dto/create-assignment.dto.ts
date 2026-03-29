import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsDefined()
  @IsNumber()
  courseUnitId!: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  attachments?: number[];
}
