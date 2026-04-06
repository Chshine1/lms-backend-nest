import { BaseError, ErrorCode } from '@app/contracts';

export class CourseNotFoundError extends BaseError<{
  courseId: number;
}> {
  constructor(courseId: number) {
    super(`Course ${String(courseId)} not found`, ErrorCode.COURSE_NOT_FOUND, {
      courseId,
    });
  }
}
