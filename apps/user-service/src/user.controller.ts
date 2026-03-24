import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { UserService } from './user.service';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';
import { ValidateUserDto } from '@app/contracts/user/dto/validate-user.dto';
import {
  UserServiceAction,
  UserServiceResource,
} from '@/user-service/src/entities/user-permission.entity';
import { RequirePermissions } from '@app/authentication/permission/permission.decorator';
import { ExtractController } from '@app/typed-client/types/extract.controller';
import { UserTypedClient } from '@app/typed-client/clients/user.typed-client';

@Controller()
export class UserController implements ExtractController<UserTypedClient> {
  constructor(private readonly userService: UserService) {}

  @RequirePermissions(UserServiceResource.USER, UserServiceAction.MANAGE)
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
    routingKey: 'user.findByTenant',
    queue: 'user-service-user-findByTenant',
  })
  findByTenant(data: { tenantId: number }): Promise<UserContract[]> {
    return this.userService.findByTenant(data.tenantId);
  }
}
