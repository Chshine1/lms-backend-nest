import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/entities/role.entity';
import { UserRoleLink } from '../../domain/entities/user-role-link.entity';
import { type IUserRepository } from '../../domain/repositories/index';
import { EmailVo, PhoneNumberVo } from '../../domain/value-objects/index';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly em: EntityManager) {}

  async save(user: User): Promise<void> {
    this.em.create(User, user);
    await this.em.flush();
  }

  findById(id: bigint): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  findByEmail(email: EmailVo): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  async existsByPhone(phone: PhoneNumberVo): Promise<boolean> {
    const count = await this.em.count(User, { phoneNumber: phone });
    return count > 0;
  }

  async getRoles(userId: bigint): Promise<Role[]> {
    const userRoleLinks = await this.em.find(UserRoleLink, { userId });
    const roleIds = userRoleLinks.map((link) => link.roleId);
    const roles = await this.em.find(Role, { id: { $in: roleIds } });
    return roles;
  }
}
