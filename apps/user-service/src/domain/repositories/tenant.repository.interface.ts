import { Tenant } from '../entities/tenant.entity';
import { InvitationCodeVo } from '../value-objects/index';

export interface ITenantRepository {
  /**
   * Find tenant by ID with optional relationship loading.
   * @param id Tenant ID
   * @param options.include Optional array of relationship keys to load
   */
  findById(
    id: bigint,
    options?: { include?: string[] },
  ): Promise<Tenant | null>;

  /**
   * Find tenant by invitation code.
   */
  findByInvitationCode(code: InvitationCodeVo): Promise<Tenant | null>;
}
