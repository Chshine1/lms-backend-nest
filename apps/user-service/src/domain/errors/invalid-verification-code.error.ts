import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class InvalidVerificationCodeError extends BaseError {
  constructor(message: string = 'The provided verification code is invalid') {
    super(message, UserErrorCode.INVALID_VERIFICATION_CODE, {});
  }
}
