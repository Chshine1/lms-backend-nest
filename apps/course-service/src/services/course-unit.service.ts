import { BadRequestException, Injectable } from '@nestjs/common';
import { Course } from '../entities/course.entity';
import { CourseUnit } from '../entities/course-unit.entity';
import { UnitBatchDto } from '@app/contracts';
import { AssignmentService } from './assignment.service';

@Injectable()
export class CourseUnitService {
  constructor(private assignmentService: AssignmentService) {}

  async updateUnits(course: Course, unitDtos: UnitBatchDto[]): Promise<void> {
    const existingUnitsMap = new Map(course.courseUnits.map((u) => [u.id, u]));
    const usedPositions = new Set(course.courseUnits.map((u) => u.position));

    for (const dto of unitDtos) {
      if (dto.id && existingUnitsMap.has(dto.id)) {
        await this.updateExistingUnit(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          existingUnitsMap.get(dto.id)!,
          dto,
          usedPositions,
        );
      } else if (!dto.id) {
        await this.createNewUnit(course, dto, usedPositions);
      } else {
        throw new BadRequestException(
          `Unit with id ${String(dto.id)} not found`,
        );
      }
    }
  }

  private async updateExistingUnit(
    unit: CourseUnit,
    dto: UnitBatchDto,
    usedPositions: Set<number>,
  ): Promise<void> {
    if (dto.title !== undefined) unit.title = dto.title;
    if (dto.description !== undefined) unit.description = dto.description;
    if (dto.position !== undefined && dto.position !== unit.position) {
      this.checkPositionConflict(usedPositions, dto.position);
      usedPositions.delete(unit.position);
      usedPositions.add(dto.position);
      unit.position = dto.position;
    }
    if (dto.assignments) {
      await this.assignmentService.updateAssignments(unit, dto.assignments);
    }
  }

  private async createNewUnit(
    course: Course,
    dto: UnitBatchDto,
    usedPositions: Set<number>,
  ): Promise<void> {
    if (
      dto.title === undefined ||
      dto.description === undefined ||
      dto.position === undefined
    ) {
      throw new BadRequestException('Missing required fields for new unit');
    }
    const newUnit = course.addUnit(dto.title, dto.description, dto.position);
    usedPositions.add(dto.position);
    if (dto.assignments) {
      await this.assignmentService.updateAssignments(newUnit, dto.assignments);
    }
  }

  private checkPositionConflict(
    usedPositions: Set<number>,
    position: number,
  ): void {
    if (usedPositions.has(position)) {
      throw new BadRequestException(
        `Position ${String(position)} already used`,
      );
    }
  }
}
