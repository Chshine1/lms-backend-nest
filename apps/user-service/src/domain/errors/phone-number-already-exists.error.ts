import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class PhoneNumberAlreadyExistsError extends BaseError<{
  phoneNumber: string;
}> {
  constructor(phoneNumber: string) {
    super(
      `Phone number already registered: ${phoneNumber}`,
      UserErrorCode.PHONE_NUMBER_ALREADY_EXISTS,
      {
        phoneNumber,
      },
    );
  }
}
