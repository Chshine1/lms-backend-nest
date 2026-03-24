import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { UserServicePatterns } from '@app/contracts/user/user.patterns';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';
import { ValidateUserDto } from '@app/contracts/user/dto/validate-user.dto';
import { TYPED_CLIENT_MODULE_OPTIONS } from '@app/typed-client/typed-client.module';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserServicePatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MODULE_OPTIONS)
    options: { exchange: string; timeout?: number },
  ) {
    super(amqpConnection, options);
  }

  createUser(data: CreateUserDto): Promise<UserContract> {
    return this.rpc('user.create', data);
  }

  validateUser(data: ValidateUserDto): Promise<UserContract | null> {
    return this.rpc('user.validate', data);
  }

  findUserById(id: number): Promise<UserContract | null> {
    return this.rpc('user.findById', { id });
  }

  findUsersByTenant(tenantId: number): Promise<UserContract[]> {
    return this.rpc('user.findByTenant', { tenantId });
  }
}
