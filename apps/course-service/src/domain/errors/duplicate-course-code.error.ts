import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/domain/error.codes';

export class DuplicateCourseCodeError extends BaseError<{ code: string }> {
  constructor(code: string) {
    super(
      `Course with code "${code}" already exists`,
      CourseErrorCode.DUPLICATE_COURSE_CODE,
      {
        code,
      },
    );
  }
}
