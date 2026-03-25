import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';
import { ValidateUserDto } from '@app/contracts/user/dto/validate-user.dto';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '@app/typed-client/typed-client.module';
import { UserPatterns } from '@app/typed-client/patterns/user.patterns';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
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
}
