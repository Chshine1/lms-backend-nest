import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/course-error.code';

export class CourseNotFoundError extends BaseError<{
  courseId: number;
}> {
  constructor(courseId: number) {
    super(
      `Course ${String(courseId)} not found`,
      CourseErrorCode.COURSE_NOT_FOUND,
      {
        courseId,
      },
    );
  }
}
