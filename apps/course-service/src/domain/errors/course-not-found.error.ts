import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/domain/error.codes';

export class CourseNotFoundError extends BaseError<{ courseId: bigint }> {
  constructor(courseId: bigint) {
    super(
      `Course with id "${String(courseId)}" not found`,
      CourseErrorCode.COURSE_NOT_FOUND,
      {
        courseId,
      },
    );
  }
}
