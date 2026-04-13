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
    name: p.string().length(255),
    invitationCode: p.type(InvitationCodeType).length(32).unique(),
  },
});

export class Tenant extends TenantSchema.class {
  constructor(name: string, invitationCode: InvitationCodeVo) {
    super();
    this.name = name;
    this.invitationCode = invitationCode;
  }

  getInvitationCode(): InvitationCodeVo {
    return this.invitationCode;
  }

  isInvitationValid(code: string): boolean {
    const invitationCode = this.getInvitationCode();
    return invitationCode.matches(code);
  }
}

TenantSchema.setClass(Tenant);
