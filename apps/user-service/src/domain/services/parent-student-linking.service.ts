import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IRoleRepository } from '../repositories/role.repository.interface';
import { ParentStudentLink } from '../entities/parent-student-link.entity';
import {
  DifferentTenantException,
  InvalidRoleLinkingException,
  UserNotFoundException,
} from '../exceptions/domain.exceptions';

@Injectable()
export class ParentStudentLinkingService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async validateAndLink(
    parentUserId: number,
    studentUserId: number,
  ): Promise<ParentStudentLink> {
    // Fetch both users
    const parentUser = await this.userRepository.findById(parentUserId);
    if (!parentUser) {
      throw new UserNotFoundException(parentUserId);
    }

    const studentUser = await this.userRepository.findById(studentUserId);
    if (!studentUser) {
      throw new UserNotFoundException(studentUserId);
    }

    // Check same tenant
    if (parentUser.tenantId !== studentUser.tenantId) {
      throw new DifferentTenantException();
    }

    // Check roles
    const parentRoles = await this.userRepository.getRoles(parentUserId);
    const studentRoles = await this.userRepository.getRoles(studentUserId);

    const hasParentRole = parentRoles.some(
      (role) => role.name.toLowerCase() === 'parent',
    );
    const hasStudentRole = studentRoles.some(
      (role) => role.name.toLowerCase() === 'student',
    );

    if (!hasParentRole) {
      throw new InvalidRoleLinkingException(
        'Parent user does not have Parent role',
      );
    }

    if (!hasStudentRole) {
      throw new InvalidRoleLinkingException(
        'Student user does not have Student role',
      );
    }

    return new ParentStudentLink(parentUserId, studentUserId);
  }
}
