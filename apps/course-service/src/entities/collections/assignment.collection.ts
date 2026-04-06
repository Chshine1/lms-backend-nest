import { CourseUnit } from '../course-unit.entity';
import {
  AssignmentBatchCreatePayload,
  AssignmentBatchDto,
  AssignmentBatchUpdatePayload,
} from '@app/contracts';
import { Assignment } from '../assignment.entity';
import { AssignmentNotFoundError } from '../../errors/index';

export class AssignmentCollection {
  private constructor(
    private readonly courseUnit: CourseUnit,
    private readonly assignments: Assignment[],
  ) {}

  static create(
    courseUnit: CourseUnit,
    assignments: Assignment[],
  ): AssignmentCollection {
    return new AssignmentCollection(courseUnit, assignments);
  }

  updateAssignments(assignmentDtos: AssignmentBatchDto[]): void {
    for (const dto of assignmentDtos) {
      if (dto.payload.mode === 'update') {
        this.updateExistingAssignment(dto.payload);
      } else {
        this.createNewAssignment(dto.payload);
      }
    }
  }

  private updateExistingAssignment(dto: AssignmentBatchUpdatePayload): void {
    const assignment = this.assignments.find((a) => a.id === dto.id);
    if (assignment === undefined) {
      throw new AssignmentNotFoundError(this.courseUnit.id, dto.id);
    }

    if (dto.title !== undefined) assignment.title = dto.title;
    if (dto.description !== undefined) assignment.description = dto.description;
    if (dto.dueDate !== undefined) assignment.dueDate = dto.dueDate;
  }

  private createNewAssignment(dto: AssignmentBatchCreatePayload): Assignment {
    const assignment = new Assignment();

    assignment.title = dto.title;
    assignment.description = dto.description;
    assignment.dueDate = dto.dueDate;

    assignment.courseUnit = this.courseUnit;
    this.assignments.push(assignment);
    return assignment;
  }
}
