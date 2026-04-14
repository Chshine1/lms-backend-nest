import { AssignmentFile } from '../entities/assignment-file.entity';

export interface IAssignmentFileRepository {
  save(file: AssignmentFile): Promise<void>;
  findByAssignmentId(assignmentId: bigint): Promise<AssignmentFile[]>;
  deleteByAssignmentId(assignmentId: bigint): Promise<void>;
}
