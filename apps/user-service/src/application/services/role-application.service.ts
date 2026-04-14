import { Injectable } from '@nestjs/common';
import type { IUserRoleAssignmentRepository } from '../../domain/repositories/index';
import { AuthorizationService } from '@/user-service/src/domain/services/authorization.service';
import { UserRoleLink } from '@/user-service/src/domain/entities/user-role-link.entity';
import { RoleAssignedToUser } from '@/user-service/src/domain/events/domain.events';
import { UnauthorizedActionError } from '@/user-service/src/domain/errors';
import { AssignRoleDto } from '@app/contracts';

@Injectable()
export class RoleApplicationService {
  constructor(
    private readonly userRoleAssignmentRepository: IUserRoleAssignmentRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async assignRoleToUser(
    adminUserId: bigint,
    dto: AssignRoleDto,
  ): Promise<void> {
    // Verify admin has permission to assign roles
    const canAssign = await this.authorizationService.can(
      adminUserId,
      'role:assign',
    );
    if (!canAssign) {
      throw new UnauthorizedActionError('role:assign');
    }

    // Create assignment
    const assignment = new UserRoleLink(
      dto.targetUserId,
      dto.roleId,
      adminUserId,
    );

    // Save assignment
    await this.userRoleAssignmentRepository.save(assignment);

    // Publish event
    const event = new RoleAssignedToUser(
      dto.targetUserId,
      dto.roleId,
      adminUserId,
    );
    // TODO: Publish event to event bus
    console.log('Event:', event);
  }
}
