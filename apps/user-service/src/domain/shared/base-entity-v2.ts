import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntityV2 {
  @PrimaryKey({ type: 'bigint' })
  id!: number;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ fieldName: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @Property({ version: true })
  version!: number;
}
