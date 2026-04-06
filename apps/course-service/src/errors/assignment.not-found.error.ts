import { BaseError, ErrorCode } from '@app/contracts';

export class AssignmentNotFoundError extends BaseError {
  constructor(courseUnitId: number, assignmentId: number) {
    super(
      `Assignment ${String(assignmentId)} not found, for course unit ${String(courseUnitId)}`,
      ErrorCode.COURSE_ASSIGNMENT_NOT_FOUND,
      {
        courseUnitId,
        assignmentId,
      },
    );
  }
}
