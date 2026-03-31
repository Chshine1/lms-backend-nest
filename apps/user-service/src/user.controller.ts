import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { UserContract, CreateUserDto, UserLoginDto } from '@app/contracts';
import {
  UserServiceAction,
  UserServiceResource,
} from '@/user-service/src/entities/user-permission.entity';
import { RequirePermissions } from '@app/authentication';
import { ExtractController, UserTypedClient } from '@app/typed-client';
import { UserReadService } from '@/user-service/src/services/user.read.service';
import { UserWriteService } from '@/user-service/src/services/user.write.service';

@Controller()
export class UserController implements ExtractController<UserTypedClient> {
  constructor(
    private readonly userReadService: UserReadService,
    private readonly userWriteService: UserWriteService,
  ) {}

  @RequirePermissions(UserServiceResource.USER, UserServiceAction.MANAGE)
  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.create',
    queue: 'user-service-user-create',
  })
  createUser(createUserDto: CreateUserDto): Promise<UserContract> {
    return this.userWriteService.create(createUserDto);
  }

  @RabbitRPC({
    exchange: 'user-service',
    routingKey: 'user.login',
    queue: 'user-service-user-login',
  })
  userLogin(userLoginDto: UserLoginDto): Promise<string> {
    return this.userReadService.userLogin(userLoginDto);
  }
}
