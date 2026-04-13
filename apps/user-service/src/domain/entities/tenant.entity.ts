import { Entity, Property } from '@mikro-orm/core';
import { BaseEntityV2 } from '../shared/base-entity-v2';
import { InvitationCode } from '../value-objects/invitation-code.value-object';

@Entity({ tableName: 'tenants' })
export class Tenant extends BaseEntityV2 {
  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({
    fieldName: 'invitation_code',
    type: 'varchar',
    length: 32,
    unique: true,
  })
  private invitationCodeValue!: string;

  constructor(name: string, invitationCode: InvitationCode) {
    super();
    this.name = name;
    this.invitationCodeValue = invitationCode.getValue();
  }

  getInvitationCode(): InvitationCode {
    return InvitationCode.create(this.invitationCodeValue);
  }

  isInvitationValid(code: string): boolean {
    const invitationCode = this.getInvitationCode();
    return invitationCode.matches(code);
  }
}
