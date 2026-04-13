import { ParentStudentLink } from '../entities/parent-student-link.entity';

export interface IParentStudentLinkRepository {
  save(link: ParentStudentLink): Promise<void>;
  findLink(
    parentId: number,
    studentId: number,
  ): Promise<ParentStudentLink | null>;
  findByParentId(parentId: number): Promise<ParentStudentLink[]>;
}
