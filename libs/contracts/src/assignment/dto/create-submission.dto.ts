import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileReference } from '../entities';

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
