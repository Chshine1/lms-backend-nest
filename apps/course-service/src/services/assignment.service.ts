import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseUnit } from '@/course-service/src/entities/course-unit.entity';
import { AssignmentBatchDto } from '@app/contracts';
import { Assignment } from '@/course-service/src/entities/assignment.entity';
import { FileTypedClient } from '@app/typed-client';

@Injectable()
export class AssignmentService {
  constructor(private fileClient: FileTypedClient) {}

  async updateAssignments(
    unit: CourseUnit,
    assignmentDtos: AssignmentBatchDto[],
  ): Promise<void> {
    const existingMap = new Map(unit.assignments.map((a) => [a.id, a]));

    for (const dto of assignmentDtos) {
      if (dto.id && existingMap.has(dto.id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await this.updateExistingAssignment(existingMap.get(dto.id)!, dto);
      } else if (!dto.id) {
        await this.createNewAssignment(unit, dto);
      } else {
        throw new BadRequestException(
          `Assignment with id ${String(dto.id)} not found`,
        );
      }
    }
  }

  private async updateExistingAssignment(
    assignment: Assignment,
    dto: AssignmentBatchDto,
  ): Promise<void> {
    if (dto.title !== undefined) assignment.title = dto.title;
    if (dto.description !== undefined) assignment.description = dto.description;
    if (dto.dueDate !== undefined) assignment.dueDate = dto.dueDate;
    if (dto.attachments !== undefined) {
      await this.fileClient.validateFileExists(dto.attachments);
      assignment.attachments = dto.attachments;
    }
  }

  private async createNewAssignment(
    unit: CourseUnit,
    dto: AssignmentBatchDto,
  ): Promise<void> {
    if (
      dto.title === undefined ||
      dto.description === undefined ||
      dto.dueDate === undefined
    ) {
      throw new BadRequestException(
        'Missing required fields for new assignment',
      );
    }
    if (dto.attachments) {
      await this.fileClient.validateFileExists(dto.attachments);
    }
    const assignment = unit.addAssignment(
      dto.title,
      dto.description,
      dto.dueDate,
    );
    if (dto.attachments) assignment.attachments = dto.attachments;
  }
}
