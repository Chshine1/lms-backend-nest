import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { ExtractController, UserTypedClient } from '@app/typed-client';
import { UserApplicationService } from './application/services/user.application-service';
import { OnboardingApplicationService } from './application/services/onboarding.application-service';
import { RoleApplicationService } from './application/services/role.application-service';
import { LinkingApplicationService } from './application/services/linking.application-service';
import { RegisterUserDto, UserDto } from '@app/contracts';

@Controller()
export class UserController implements ExtractController<UserTypedClient> {
  constructor(
    private readonly userApplicationService: UserApplicationService,
    private readonly onboardingApplicationService: OnboardingApplicationService,
    private readonly roleApplicationService: RoleApplicationService,
    private readonly linkingApplicationService: LinkingApplicationService,
  ) {}

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.register',
    queue: 'user-service-user-register',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  registerUser(data: RegisterUserDto): Promise<UserDto> {
    return this.userApplicationService.registerByEmail(data);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.find-by-id',
    queue: 'user-service-user-find-by-id',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  findUserById(data: { userId: bigint }): Promise<UserDto | null> {
    return this.userApplicationService.findById(data.userId);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.assign-role',
    queue: 'user-service-user-assign-role',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  assignRole(data: {
    adminUserId: bigint;
    targetUserId: bigint;
    roleId: bigint;
  }): Promise<void> {
    return this.roleApplicationService.assignRoleToUser(data.adminUserId, {
      targetUserId: data.targetUserId,
      roleId: data.roleId,
    });
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.link-parent-student',
    queue: 'user-service-user-link-parent-student',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  linkParentStudent(data: {
    parentUserId: bigint;
    studentUserId: bigint;
  }): Promise<void> {
    return this.linkingApplicationService.linkParentToStudent(data);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.complete-onboarding',
    queue: 'user-service-user-complete-onboarding',
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  completeOnboarding(data: {
    studentUserId: bigint;
    signatureData?: Record<string, unknown>;
  }): Promise<void> {
    return this.onboardingApplicationService.confirmStudentOnboarding(data);
  }

  async userLogin(data: {
    username: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const token = await this.userApplicationService.authenticate(
      data.username,
      data.password,
    );
    return { accessToken: token };
  }
}
