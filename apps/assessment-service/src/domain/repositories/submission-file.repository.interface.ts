import { SubmissionFile } from '../entities/submission-file.entity';

export interface ISubmissionFileRepository {
  save(file: SubmissionFile): Promise<void>;
  findBySubmissionId(submissionId: bigint): Promise<SubmissionFile[]>;
  deleteBySubmissionId(submissionId: bigint): Promise<void>;
}
