import { Tenant } from '../entities/tenant.entity';
import { InvitationCode } from '../value-objects/invitation-code.value-object';

export interface ITenantRepository {
  findById(id: number): Promise<Tenant | null>;
  findByInvitationCode(code: InvitationCode): Promise<Tenant | null>;
}
