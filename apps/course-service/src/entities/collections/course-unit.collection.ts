import { CourseUnit } from '../course-unit.entity';
import {
  CourseUnitBatchCreatePayload,
  CourseUnitBatchDto,
  CourseUnitBatchUpdatePayload,
} from '@app/contracts';
import { Course } from '../course.entity';
import { CourseUnitNotFoundError } from '../../errors/index';

export class CourseUnitCollection {
  private constructor(
    private readonly course: Course,
    private readonly courseUnits: CourseUnit[],
  ) {}

  static create(course: Course, units: CourseUnit[]): CourseUnitCollection {
    return new CourseUnitCollection(course, units);
  }

  updateCourseUnits(courseUnitDtos: CourseUnitBatchDto[]): void {
    // TODO: This uses float ordering, precision boundary conditions need extra handling
    for (const dto of courseUnitDtos) {
      if (dto.payload.mode === 'update') {
        this.updateExistingCourseUnit(dto.payload);
      } else {
        this.createNewCourseUnit(dto.payload);
      }
    }
  }

  createNewCourseUnit(dto: CourseUnitBatchCreatePayload): CourseUnit {
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

  private updateExistingCourseUnit(dto: CourseUnitBatchUpdatePayload): void {
    const courseUnit = this.courseUnits.find((c) => c.id === dto.id);
    if (courseUnit === undefined) {
      throw new CourseUnitNotFoundError(this.course.id, dto.id);
    }

    if (dto.title !== undefined) courseUnit.title = dto.title;
    if (dto.description !== undefined) courseUnit.description = dto.description;
    if (dto.position !== undefined) courseUnit.position = dto.position;

    if (dto.assignments !== undefined) {
      courseUnit.updateAssignments(dto.assignments);
    }
  }
}
