import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/domain/error.codes';

export class AlreadyEnrolledError extends BaseError<{
  studentId: bigint;
  courseId: bigint;
}> {
  constructor(studentId: bigint, courseId: bigint) {
    super(
      `Student ${String(studentId)} is already enrolled in course ${String(courseId)}`,
      CourseErrorCode.ALREADY_ENROLLED,
      { studentId, courseId },
    );
  }
}
