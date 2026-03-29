import {
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { AssignmentType } from '../entities/assignment.contract';

export class CreateAssignmentDto {
  @IsDefined()
  @IsInt()
  courseUnitId!: number;

  @IsDefined()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsEnum(AssignmentType)
  type!: AssignmentType;

  @IsDefined()
  @IsInt()
  maxScore!: number;

  @IsOptional()
  dueDate?: Date;

  @IsDefined()
  @IsInt()
  order!: number;
}
