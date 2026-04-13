import { Entity, Property } from '@mikro-orm/core';
import { BaseEntityV2 } from '../shared/base-entity-v2';

@Entity({ tableName: 'roles' })
export class Role extends BaseEntityV2 {
  @Property({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Property({ type: 'jsonb' })
  permissions!: string[];

  constructor(name: string, permissions: string[]) {
    super();
    this.name = name;
    this.permissions = permissions;
  }
}
