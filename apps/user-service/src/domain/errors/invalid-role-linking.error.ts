import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class InvalidRoleLinkingError extends BaseError {
  constructor(reason: string) {
    super(reason, UserErrorCode.INVALID_ROLE_LINKING, {
      reason,
    });
  }
}
