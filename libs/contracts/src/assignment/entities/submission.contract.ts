import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';
import { SubmissionStatus } from './submission-status.enum';
import { FileReference } from './file-reference.value';

export class SubmissionContract extends BaseEntityContract {
  @Expose()
  enrollmentId!: number;

  @Expose()
  assignmentId!: number;

  @Expose()
  submissionText?: string;

  @Expose()
  attachments?: FileReference[];

  @Expose()
  submittedAt?: Date;

  @Expose()
  status!: SubmissionStatus;
}
