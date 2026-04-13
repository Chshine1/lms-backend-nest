import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class UnauthorizedActionError extends BaseError<{
  action: string;
}> {
  constructor(action: string) {
    super(
      `Unauthorized to perform action: ${action}`,
      UserErrorCode.UNAUTHORIZED_ACTION,
      {
        action,
      },
    );
  }
}
