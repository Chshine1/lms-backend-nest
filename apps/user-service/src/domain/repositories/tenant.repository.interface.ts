import { Tenant } from '../entities/tenant.entity';
import { InvitationCodeVo } from '@app/contracts';

export interface ITenantRepository {
  findById(id: number): Promise<Tenant | null>;
  findByInvitationCode(code: InvitationCodeVo): Promise<Tenant | null>;
}
