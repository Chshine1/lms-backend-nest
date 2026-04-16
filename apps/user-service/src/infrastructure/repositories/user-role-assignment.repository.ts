import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { UserRoleLink } from '../../domain/entities/user-role-link.entity';
import type { IUserRoleAssignmentRepository } from '../../domain/repositories/index';

@Injectable()
export class UserRoleAssignmentRepository implements IUserRoleAssignmentRepository {
  constructor(private readonly em: EntityManager) {}

  async save(assignment: UserRoleLink): Promise<void> {
    this.em.create(UserRoleLink, assignment);
    await this.em.flush();
  }

  findByUserId(userId: bigint): Promise<UserRoleLink[]> {
    return this.em.find(UserRoleLink, { userId });
  }

  findByRoleId(roleId: bigint): Promise<UserRoleLink[]> {
    return this.em.find(UserRoleLink, { roleId });
  }

  async delete(userId: bigint, roleId: bigint): Promise<void> {
    const link = await this.em.findOne(UserRoleLink, { userId, roleId });
    if (link) {
      this.em.remove(link);
      await this.em.flush();
    }
  }
}
