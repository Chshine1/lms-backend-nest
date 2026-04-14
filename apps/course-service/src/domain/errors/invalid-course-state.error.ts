import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class InvalidCourseStateError extends BaseError<{ reason: string }> {
  constructor(reason: string) {
    super(`Invalid course state: ${reason}`, ErrorCode.BAD_REQUEST, {
      reason,
    });
  }
}
