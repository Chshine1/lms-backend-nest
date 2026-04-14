import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class CourseNotFoundError extends BaseError<{ courseId: bigint }> {
  constructor(courseId: bigint) {
    super(
      `Course with id "${String(courseId)}" not found`,
      ErrorCode.BAD_REQUEST,
      {
        courseId,
      },
    );
  }
}
