import { BaseError } from '@app/contracts';
import { ErrorCode } from '@app/contracts';

export class DuplicateCourseCodeError extends BaseError<{ code: string }> {
  constructor(code: string) {
    super(`Course with code "${code}" already exists`, ErrorCode.BAD_REQUEST, {
      code,
    });
  }
}
