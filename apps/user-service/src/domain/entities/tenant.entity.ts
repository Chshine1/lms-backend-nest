import { defineEntity, p } from '@mikro-orm/core';
import { InvitationCode } from '../value-objects/invitation-code.value-object';
import { AggregateRootSchema } from '@app/contracts';

const TenantSchema = defineEntity({
  name: 'Tenant',
  extends: AggregateRootSchema,
  tableName: 'tenants',
  properties: {
    name: p.string().length(255),
    invitationCode: p.string().length(32).unique(),
  },
});

export class Tenant extends TenantSchema.class {
  constructor(name: string, invitationCode: InvitationCode) {
    super();
    this.name = name;
    this.invitationCode = invitationCode.getValue();
  }

  getInvitationCode(): InvitationCode {
    return InvitationCode.create(this.invitationCode);
  }

  isInvitationValid(code: string): boolean {
    const invitationCode = this.getInvitationCode();
    return invitationCode.matches(code);
  }
}

TenantSchema.setClass(Tenant);
