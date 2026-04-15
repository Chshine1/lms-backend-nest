import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Tenant } from '../../domain/entities/tenant.entity';
import type { ITenantRepository } from '../../domain/repositories/index';
import { InvitationCodeVo } from '../../domain/value-objects/index';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: bigint): Promise<Tenant | null> {
    return this.em.findOne(Tenant, { id });
  }

  findByInvitationCode(code: InvitationCodeVo): Promise<Tenant | null> {
    return this.em.findOne(Tenant, { invitationCode: code });
  }
}
