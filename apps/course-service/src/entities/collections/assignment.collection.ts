import { CourseUnit } from '@/course-service/src/entities/course-unit.entity';
import { AssignmentBatchDto } from '@app/contracts';
import { BadRequestException } from '@nestjs/common';
import { Assignment } from '@/course-service/src/entities/assignment.entity';

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
      if (dto.id !== undefined) {
        this.updateExistingAssignment(dto.id, dto);
      } else {
        this.createNewAssignment(dto);
      }
    }
  }

  private updateExistingAssignment(id: number, dto: AssignmentBatchDto): void {
    const assignment = this.assignments.find((a) => a.id === id);
    if (assignment === undefined) {
      throw new BadRequestException(
        `Assignment with id ${String(dto.id)} not found`,
      );
    }

    if (dto.title !== undefined) assignment.title = dto.title;
    if (dto.description !== undefined) assignment.description = dto.description;
    if (dto.dueDate !== undefined) assignment.dueDate = dto.dueDate;
  }

  private createNewAssignment(dto: AssignmentBatchDto): Assignment {
    if (
      dto.title === undefined ||
      dto.description === undefined ||
      dto.dueDate === undefined
    ) {
      throw new BadRequestException(
        'Missing required fields for new assignment',
      );
    }

    const assignment = new Assignment();

    assignment.title = dto.title;
    assignment.description = dto.description;
    assignment.dueDate = dto.dueDate;

    assignment.courseUnit = this.courseUnit;
    this.assignments.push(assignment);
    return assignment;
  }
}
