import {
  IsDefined,
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
} from 'class-validator';
import { FileReference } from '../entities/file-reference.value';

export class CreateSubmissionDto {
  @IsDefined()
  @IsNumber()
  enrollmentId!: number;

  @IsDefined()
  @IsNumber()
  assignmentId!: number;

  @IsString()
  @IsOptional()
  submissionText?: string;

  @IsArray()
  @IsOptional()
  attachments?: FileReference[];
}
