import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user_role_assignments' })
export class UserRoleAssignment {
  @PrimaryKey({ fieldName: 'user_id', type: 'bigint' })
  userId!: number;

  @PrimaryKey({ fieldName: 'role_id', type: 'bigint' })
  roleId!: number;

  @Property({ fieldName: 'assigned_by', type: 'bigint' })
  assignedBy!: number;

  @Property({ fieldName: 'assigned_at' })
  assignedAt: Date = new Date();

  constructor(userId: number, roleId: number, assignedBy: number) {
    this.userId = userId;
    this.roleId = roleId;
    this.assignedBy = assignedBy;
    this.assignedAt = new Date();
  }
}
