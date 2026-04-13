import { ParentStudentLink } from '../entities/parent-student-link.entity';

export interface IParentStudentLinkRepository {
  save(link: ParentStudentLink): Promise<void>;
  findLink(
    parentId: bigint,
    studentId: bigint,
  ): Promise<ParentStudentLink | null>;
  findByParentId(parentId: bigint): Promise<ParentStudentLink[]>;
}
