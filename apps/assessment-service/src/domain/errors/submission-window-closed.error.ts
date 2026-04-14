import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class SubmissionWindowClosedError extends BaseError<{
  assignmentId: bigint;
}> {
  constructor(assignmentId: bigint) {
    super(
      `Submission window has closed for assignment ${String(assignmentId)}`,
      ErrorCode.BAD_REQUEST,
      { assignmentId },
    );
  }
}
