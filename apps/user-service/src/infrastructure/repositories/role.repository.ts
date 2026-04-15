import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Role } from '../../domain/entities/role.entity';
import type { IRoleRepository } from '../../domain/repositories/index';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: bigint): Promise<Role | null> {
    return this.em.findOne(Role, { id });
  }

  findByName(name: string): Promise<Role | null> {
    return this.em.findOne(Role, { name });
  }
}
