import { Inject, Injectable } from '@nestjs/common';
import type {
  IUserRepository,
  IParentStudentLinkRepository,
} from '../repositories/index';
import {
  UserRepository,
  ParentStudentLinkRepository,
} from '../../infrastructure/repositories/index';

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(ParentStudentLinkRepository)
    private readonly linkRepository: IParentStudentLinkRepository,
  ) {}

  async can(
    userId: bigint,
    action: string,
    resourceId?: bigint,
  ): Promise<boolean> {
    const roles = await this.userRepository.getRoles(userId);

    for (const role of roles) {
      for (const permTag of role.permissions) {
        if (this.matchesActionPattern(permTag, action)) {
          if (!this.hasScopeSuffix(permTag)) {
            return true;
          }

          if (permTag.includes(':linked_parent') && resourceId) {
            const link = await this.linkRepository.findLink(userId, resourceId);
            if (link) {
              return true;
            }
          }

          if (permTag.includes(':own') && resourceId) {
            if (userId === resourceId) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private matchesActionPattern(permTag: string, action: string): boolean {
    const parts = permTag.split(':');
    const actionParts = action.split(':');

    if (parts.length < 2 || actionParts.length < 2) {
      return false;
    }

    return parts[0] === actionParts[0] && parts[1] === actionParts[1];
  }

  private hasScopeSuffix(permTag: string): boolean {
    const parts = permTag.split(':');
    return parts.length > 2;
  }
}
