import { BaseError } from '@app/contracts';
import { UserErrorCode } from '@/user-service/src/domain/error.codes';

export class TenantNotFoundError extends BaseError<{
  tenantId: bigint;
}> {
  constructor(tenantId: bigint) {
    super(
      `Tenant not found: ${String(tenantId)}`,
      UserErrorCode.TENANT_NOT_FOUND,
      {
        tenantId: tenantId,
      },
    );
  }
}
