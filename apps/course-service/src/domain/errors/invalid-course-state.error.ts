import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/domain/error.codes';

export class InvalidCourseStateError extends BaseError<{ reason: string }> {
  constructor(reason: string) {
    super(
      `Invalid course state: ${reason}`,
      CourseErrorCode.INVALID_COURSE_STATE,
      {
        reason,
      },
    );
  }
}
