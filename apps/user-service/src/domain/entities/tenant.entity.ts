import { defineEntity, p } from '@mikro-orm/core';
import {
  AggregateRootSchema,
  InvitationCodeType,
  InvitationCodeVo,
} from '@app/contracts';

const TenantSchema = defineEntity({
  name: 'Tenant',
  extends: AggregateRootSchema,
  tableName: 'tenants',
  properties: {
    invitationCode: p.type(InvitationCodeType).length(32).unique(),
  },
});

export class Tenant extends TenantSchema.class {
  constructor(invitationCode: InvitationCodeVo) {
    super();
    this.invitationCode = invitationCode;
  }

  isInvitationValid(code: string): boolean {
    const invitationCode = this.invitationCode;
    return invitationCode.matches(code);
  }
}

TenantSchema.setClass(Tenant);
