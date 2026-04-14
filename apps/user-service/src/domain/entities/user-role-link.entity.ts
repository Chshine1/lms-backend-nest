import { defineEntity, p } from '@mikro-orm/core';
import { LinkEntitySchema } from '@app/contracts';

const UserRoleLinkSchema = defineEntity({
  name: 'UserRoleLink',
  extends: LinkEntitySchema,
  tableName: 'lnk_user_role',
  properties: {
    userId: p.bigint().primary(),
    roleId: p.bigint().primary(),
    assignedBy: p.bigint(),
  },
});

export class UserRoleLink extends UserRoleLinkSchema.class {
  constructor(userId: bigint, roleId: bigint, assignedBy: bigint) {
    super();
    this.userId = userId;
    this.roleId = roleId;
    this.assignedBy = assignedBy;
  }
}

UserRoleLinkSchema.setClass(UserRoleLink);
