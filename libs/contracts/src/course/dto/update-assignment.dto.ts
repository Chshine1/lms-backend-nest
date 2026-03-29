import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  attachments?: number[];
}
