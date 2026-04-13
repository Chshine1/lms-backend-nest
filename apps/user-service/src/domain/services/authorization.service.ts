import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IParentStudentLinkRepository } from '../repositories/parent-student-link.repository.interface';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly linkRepository: IParentStudentLinkRepository,
  ) {}

  async can(
    userId: number,
    action: string,
    resourceId?: number,
  ): Promise<boolean> {
    const roles = await this.userRepository.getRoles(userId);

    for (const role of roles) {
      for (const permTag of role.permissions) {
        if (this.matchesActionPattern(permTag, action)) {
          // Static permission (no relationship scope) → grant
          if (!this.hasScopeSuffix(permTag)) {
            return true;
          }

          // Relationship-based scope (e.g., ":linked_parent") → check link table
          if (permTag.includes(':linked_parent') && resourceId) {
            const link = await this.linkRepository.findLink(userId, resourceId);
            if (link) {
              return true;
            }
          }

          // Additional relationship checks (e.g., ":own") can be added here
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
    // Simple pattern matching: "resource:action:scope" or "resource:action"
    // Example: permTag = "student:read:linked_parent", action = "student:read"
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
