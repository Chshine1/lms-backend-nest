import { CourseUnit } from '../course-unit.entity';
import { CourseUnitBatchDto } from '@app/contracts';
import { BadRequestException } from '@nestjs/common';
import { Course } from '@/course-service/src/entities/course.entity';

export class CourseUnitCollection {
  private constructor(
    private course: Course,
    private courseUnits: CourseUnit[],
  ) {}

  static create(course: Course, units: CourseUnit[]): CourseUnitCollection {
    return new CourseUnitCollection(course, units);
  }

  updateCourseUnits(courseUnitDtos: CourseUnitBatchDto[]): void {
    // TODO: This uses float ordering, precision boundary conditions need extra handling
    for (const dto of courseUnitDtos) {
      if (dto.id !== undefined) {
        this.updateExistingCourseUnit(dto.id, dto);
      } else {
        this.createNewCourseUnit(dto);
      }
    }
  }

  private updateExistingCourseUnit(id: number, dto: CourseUnitBatchDto): void {
    const courseUnit = this.courseUnits.find((u) => u.id === id);
    if (courseUnit === undefined) {
      throw new BadRequestException(`Unit with id ${String(dto.id)} not found`);
    }

    if (dto.title !== undefined) courseUnit.title = dto.title;
    if (dto.description !== undefined) courseUnit.description = dto.description;
    if (dto.position !== undefined) courseUnit.position = dto.position;

    if (dto.assignments !== undefined) {
      courseUnit.updateAssignments(dto.assignments);
    }
  }

  createNewCourseUnit(dto: CourseUnitBatchDto): CourseUnit {
    if (
      dto.title === undefined ||
      dto.description === undefined ||
      dto.position === undefined
    ) {
      throw new BadRequestException(
        'Missing required fields for new course unit',
      );
    }

    const courseUnit = new CourseUnit();

    courseUnit.title = dto.title;
    courseUnit.description = dto.description;
    courseUnit.position = dto.position;

    if (dto.assignments !== undefined) {
      courseUnit.updateAssignments(dto.assignments);
    }

    courseUnit.course = this.course;
    this.courseUnits.push(courseUnit);
    return courseUnit;
  }
}
