import { BaseError } from '@app/contracts';
import { AssessmentErrorCode } from '@/assessment-service/src/domain/error.codes';

export class SubmissionWindowClosedError extends BaseError<{
  assignmentId: bigint;
}> {
  constructor(assignmentId: bigint) {
    super(
      `Submission window has closed for assignment ${String(assignmentId)}`,
      AssessmentErrorCode.SUBMISSION_WINDOW_CLOSED,
      { assignmentId },
    );
  }
}
