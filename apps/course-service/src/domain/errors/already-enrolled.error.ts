import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class AlreadyEnrolledError extends BaseError<{
  studentId: bigint;
  courseId: bigint;
}> {
  constructor(studentId: bigint, courseId: bigint) {
    super(
      `Student ${studentId} is already enrolled in course ${courseId}`,
      ErrorCode.ALREADY_ENROLLED,
      { studentId, courseId },
    );
  }
}
