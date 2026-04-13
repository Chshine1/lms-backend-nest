import { Injectable } from '@nestjs/common';
import { IUserRoleAssignmentRepository } from '@/user-service/src/domain/repositories/user-role-assignment.repository.interface';
import { AuthorizationService } from '@/user-service/src/domain/services/authorization.service';
import { UserRoleAssignment } from '@/user-service/src/domain/entities/user-role-link.entity';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { UnauthorizedActionException } from '@/user-service/src/domain/exceptions/domain.exceptions';
import { RoleAssignedToUser } from '@/user-service/src/domain/events/domain.events';

@Injectable()
export class RoleApplicationService {
  constructor(
    private readonly userRoleAssignmentRepository: IUserRoleAssignmentRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async assignRoleToUser(
    adminUserId: number,
    dto: AssignRoleDto,
  ): Promise<void> {
    // Verify admin has permission to assign roles
    const canAssign = await this.authorizationService.can(
      adminUserId,
      'role:assign',
    );
    if (!canAssign) {
      throw new UnauthorizedActionException('role:assign');
    }

    // Create assignment
    const assignment = new UserRoleAssignment(
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
