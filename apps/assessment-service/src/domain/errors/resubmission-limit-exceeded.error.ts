import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class ResubmissionLimitExceededError extends BaseError<{
  assignmentId: bigint;
  limit: number;
}> {
  constructor(assignmentId: bigint, limit: number) {
    super(
      `Resubmission limit (${String(limit)}) exceeded for assignment ${String(assignmentId)}`,
      ErrorCode.BAD_REQUEST,
      { assignmentId, limit },
    );
  }
}
