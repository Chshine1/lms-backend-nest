import { Expose } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { defineEntity, p } from '@mikro-orm/core';

export class BaseEntityContract {
  @Expose()
  id!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  deletedAt?: Date;

  @Expose()
  version!: number;
}

export abstract class BaseEntity implements BaseEntityContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @VersionColumn()
  version!: number;
}

export const BaseEntitySchema = defineEntity({
  name: 'BaseEntity',
  abstract: true,
  properties: {
    id: p.bigint().primary(),
  },
});

export const LinkEntitySchema = defineEntity({
  name: 'RelationEntitySchema',
  abstract: true,
  properties: {
    createdAt: p.datetime().onCreate(() => new Date()),
    deletedAt: p.datetime().nullable(),
  },
});

export const AggregateRootSchema = defineEntity({
  name: 'AggregateRoot',
  abstract: true,
  properties: {
    id: p.bigint().primary(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
    deletedAt: p.datetime().nullable(),
    version: p.integer().version(),
  },
});
