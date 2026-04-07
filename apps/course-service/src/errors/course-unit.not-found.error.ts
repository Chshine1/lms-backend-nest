import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/course-error.code';

export class CourseUnitNotFoundError extends BaseError<{
  courseId: number;
  courseUnitId: number;
}> {
  constructor(courseId: number, courseUnitId: number) {
    super(
      `Course unit ${String(courseUnitId)} for course ${String(courseId)} not found`,
      CourseErrorCode.COURSE_UNIT_NOT_FOUND,
      {
        courseId,
        courseUnitId,
      },
    );
  }
}
