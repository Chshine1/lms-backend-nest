import { IsString, IsArray, IsOptional } from 'class-validator';
import { FileReference } from '../entities/file-reference.value';

export class UpdateSubmissionDto {
  @IsString()
  @IsOptional()
  submissionText?: string;

  @IsArray()
  @IsOptional()
  attachments?: FileReference[];
}
