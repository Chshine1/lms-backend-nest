import { defineEntity, p } from '@mikro-orm/core';
import { AggregateRootSchema, VarcharArrayType } from '@app/contracts';

const RoleSchema = defineEntity({
  name: 'Role',
  extends: AggregateRootSchema,
  tableName: 'roles',
  properties: {
    name: p.string().length(50).unique(),
    permissions: p.type(new VarcharArrayType(100)),
  },
});

export class Role extends RoleSchema.class {
  constructor(name: string, permissions: string[]) {
    super();
    this.name = name;
    this.permissions = [...permissions];
  }
}

RoleSchema.setClass(Role);
