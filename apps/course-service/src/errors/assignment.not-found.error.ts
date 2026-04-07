import { BaseError } from '@app/contracts';
import { CourseErrorCode } from '@/course-service/src/course-error.code';

export class AssignmentNotFoundError extends BaseError<{
  courseUnitId: number;
  assignmentId: number;
}> {
  constructor(courseUnitId: number, assignmentId: number) {
    super(
      `Assignment ${String(assignmentId)} not found, for course unit ${String(courseUnitId)}`,
      CourseErrorCode.COURSE_ASSIGNMENT_NOT_FOUND,
      {
        courseUnitId,
        assignmentId,
      },
    );
  }
}
