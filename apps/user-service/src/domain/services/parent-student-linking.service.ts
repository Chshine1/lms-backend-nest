import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../repositories/index';
import { UserRepository } from '../../infrastructure/repositories/index';
import { ParentStudentLink } from '../entities/parent-student-link.entity';
import {
  DifferentTenantError,
  InvalidRoleLinkingError,
  UserNotFoundError,
} from '../errors/index';

@Injectable()
export class ParentStudentLinkingService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async validateAndLink(
    parentUserId: bigint,
    studentUserId: bigint,
  ): Promise<ParentStudentLink> {
    const parentUser = await this.userRepository.findById(parentUserId);
    if (!parentUser) {
      throw new UserNotFoundError(parentUserId);
    }

    const studentUser = await this.userRepository.findById(studentUserId);
    if (!studentUser) {
      throw new UserNotFoundError(studentUserId);
    }

    if (parentUser.tenantId !== studentUser.tenantId) {
      throw new DifferentTenantError();
    }

    const parentRoles = await this.userRepository.getRoles(parentUserId);
    const studentRoles = await this.userRepository.getRoles(studentUserId);

    const hasParentRole = parentRoles.some(
      (role) => role.name.toLowerCase() === 'parent',
    );
    const hasStudentRole = studentRoles.some(
      (role) => role.name.toLowerCase() === 'student',
    );

    if (!hasParentRole) {
      throw new InvalidRoleLinkingError(
        'Parent user does not have Parent role',
      );
    }

    if (!hasStudentRole) {
      throw new InvalidRoleLinkingError(
        'Student user does not have Student role',
      );
    }

    return new ParentStudentLink(parentUserId, studentUserId);
  }
}
