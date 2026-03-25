import { IsArray, IsOptional, IsString } from 'class-validator';
import { FileReference } from '../entities';

export class UpdateSubmissionDto {
  @IsString()
  @IsOptional()
  submissionText?: string;

  @IsArray()
  @IsOptional()
  attachments?: FileReference[];
}
