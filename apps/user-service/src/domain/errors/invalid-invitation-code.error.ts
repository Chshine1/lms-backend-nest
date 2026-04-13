import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class InvalidInvitationCodeError extends BaseError {
  constructor() {
    super(
      `The provided invitation code is invalid`,
      UserErrorCode.INVALID_INVITATION_CODE,
      {},
    );
  }
}
