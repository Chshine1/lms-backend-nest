import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class EmailAlreadyExistsError extends BaseError<{
  email: string;
}> {
  constructor(email: string) {
    super(
      `Email already registered: ${email}`,
      UserErrorCode.EMAIL_ALREADY_EXISTS,
      {
        email,
      },
    );
  }
}
