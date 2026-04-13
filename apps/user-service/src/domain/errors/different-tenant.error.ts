import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class DifferentTenantError extends BaseError {
  constructor() {
    super(
      'Users must belong to the same tenant',
      UserErrorCode.DIFFERENT_TENANT,
      {},
    );
  }
}
