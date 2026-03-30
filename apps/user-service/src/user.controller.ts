import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { UserService } from './user.service';
import { TenantService } from './tenant.service';
import {
  CreateUserDto,
  UserContract,
  ValidateUserDto,
  TenantContract,
} from '@app/contracts';
import {
  UserServiceAction,
  UserServiceResource,
} from '@/user-service/src/entities/user-permission.entity';
import { RequirePermissions } from '@app/authentication';
import { ExtractController, UserTypedClient } from '@app/typed-client';

@Controller()
export class UserController implements ExtractController<UserTypedClient> {
  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
  ) {}

  @RequirePermissions([[UserServiceResource.USER, UserServiceAction.MANAGE]])
  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.create',
    queue: 'user-service-user-create',
  })
  createUser(createUserDto: CreateUserDto): Promise<UserContract> {
    return this.userService.create(createUserDto);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.validate',
    queue: 'user-service-user-validate',
  })
  validateUser(data: ValidateUserDto): Promise<UserContract | null> {
    return this.userService.validateUser(data.username, data.password);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.findById',
    queue: 'user-service-user-findById',
  })
  findUserById(id: number): Promise<UserContract | null> {
    return this.userService.findById(id);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'tenant.findById',
    queue: 'user-service-tenant-findById',
  })
  findTenantById(id: number): Promise<TenantContract | null> {
    return this.tenantService.findById(id);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'tenant.validate',
    queue: 'user-service-tenant-validate',
  })
  validateTenant(id: number): Promise<TenantContract | null> {
    return this.tenantService.validateTenant(id);
  }
}
