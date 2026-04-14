import { Assignment } from '../entities/assignment.entity';

export interface IAssignmentRepository {
  save(assignment: Assignment): Promise<void>;
  findById(id: bigint): Promise<Assignment | null>;
  findByUnitId(unitId: bigint): Promise<Assignment[]>;
}
