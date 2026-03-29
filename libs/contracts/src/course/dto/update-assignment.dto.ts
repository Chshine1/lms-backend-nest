import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AssignmentType } from '../entities/assignment.contract';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @IsOptional()
  @IsInt()
  maxScore?: number;

  @IsOptional()
  dueDate?: Date;

  @IsOptional()
  @IsInt()
  order?: number;
}
