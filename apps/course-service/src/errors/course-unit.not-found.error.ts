import { BaseError, ErrorCode } from '@app/contracts';

export class CourseUnitNotFoundError extends BaseError<{
  courseId: number;
  courseUnitId: number;
}> {
  constructor(courseId: number, courseUnitId: number) {
    super(
      `Course unit ${String(courseUnitId)} for course ${String(courseId)} not found`,
      ErrorCode.COURSE_UNIT_NOT_FOUND,
      {
        courseId,
        courseUnitId,
      },
    );
  }
}
