import { BaseError } from '@app/contracts';
import { UserErrorCode } from '../error.codes';

export class InvalidPhoneNumberError extends BaseError<{
  phoneNumber: string;
}> {
  constructor(phoneNumber: string) {
    super(
      `Invalid phone number format: ${phoneNumber}`,
      UserErrorCode.INVALID_PHONE_NUMBER,
      {
        phoneNumber,
      },
    );
  }
}
