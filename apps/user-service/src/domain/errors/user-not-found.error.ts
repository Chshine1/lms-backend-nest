import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class UserNotFoundError extends BaseError<{
  userId: bigint;
}> {
  constructor(userId: bigint) {
    super(`User not found: ${String(userId)}}`, UserErrorCode.USER_NOT_FOUND, {
      userId: userId,
    });
  }
}
