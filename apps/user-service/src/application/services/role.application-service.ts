import { Inject, Injectable } from '@nestjs/common';
import type { IUserRoleAssignmentRepository } from '../../domain/repositories/index';
import { UserRoleAssignmentRepository } from '../../infrastructure/repositories/index';
import { AuthorizationService } from '@/user-service/src/domain/services/authorization.service';
import { UserRoleLink } from '@/user-service/src/domain/entities/user-role-link.entity';
import { RoleAssignedToUser } from '@/user-service/src/domain/events/domain.events';
import { UnauthorizedActionError } from '@/user-service/src/domain/errors';
import { AssignRoleDto } from '@app/contracts';
import { EventBusService } from '@app/event-bus';

@Injectable()
export class RoleApplicationService {
  constructor(
    @Inject(UserRoleAssignmentRepository)
    private readonly userRoleAssignmentRepository: IUserRoleAssignmentRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly eventBus: EventBusService,
  ) {}

  async assignRoleToUser(
    adminUserId: bigint,
    dto: AssignRoleDto,
  ): Promise<void> {
    const canAssign = await this.authorizationService.can(
      adminUserId,
      'role:assign',
    );
    if (!canAssign) {
      throw new UnauthorizedActionError('role:assign');
    }

    const assignment = new UserRoleLink(
      dto.targetUserId,
      dto.roleId,
      adminUserId,
    );

    await this.userRoleAssignmentRepository.save(assignment);

    const event = new RoleAssignedToUser(
      dto.targetUserId,
      dto.roleId,
      adminUserId,
    );
    await this.eventBus.publish(event);
  }
}
