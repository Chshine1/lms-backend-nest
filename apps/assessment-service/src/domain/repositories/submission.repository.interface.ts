import { Submission } from '../entities/submission.entity';

export interface ISubmissionRepository {
  save(submission: Submission): Promise<void>;
  findById(id: bigint): Promise<Submission | null>;
  findByStudentAndAssignment(
    studentId: bigint,
    assignmentId: bigint,
  ): Promise<Submission | null>;
}
