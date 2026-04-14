import { defineEntity, p } from '@mikro-orm/core';

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
