import { BaseError } from '@app/contracts';
import { AssessmentErrorCode } from '@/assessment-service/src/domain/error.codes';

export class ResubmissionLimitExceededError extends BaseError<{
  assignmentId: bigint;
  limit: number;
}> {
  constructor(assignmentId: bigint, limit: number) {
    super(
      `Resubmission limit (${String(limit)}) exceeded for assignment ${String(assignmentId)}`,
      AssessmentErrorCode.RESUBMISSION_LIMIT_EXCEEDED,
      { assignmentId, limit },
    );
  }
}
