import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class WeakPasswordError extends BaseError<{
  reason: string;
}> {
  constructor(reason: string) {
    super(
      `Password does not meet complexity requirements: ${reason}`,
      UserErrorCode.WEAK_PASSWORD,
      {
        reason,
      },
    );
  }
}
