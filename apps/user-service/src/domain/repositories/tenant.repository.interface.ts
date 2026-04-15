import { Tenant } from '../entities/tenant.entity';
import { InvitationCodeVo } from '../value-objects/index';

export interface ITenantRepository {
  findById(id: bigint): Promise<Tenant | null>;
  findByInvitationCode(code: InvitationCodeVo): Promise<Tenant | null>;
}
