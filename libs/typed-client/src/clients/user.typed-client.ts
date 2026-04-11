import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { UserPatterns } from '../patterns/user.patterns';
import { CreateUserDto, UserContract, UserLoginDto } from '@app/contracts';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TraceService } from '@app/trace';
import { UserContextService } from '@app/authentication';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super(
      'user-service',
      amqpConnection,
      traceService,
      userContextService,
      options,
    );
  }

  createUser(createUserDto: CreateUserDto): Promise<UserContract> {
    return this.rpc('user.create', createUserDto);
  }

  userLogin(userLoginDto: UserLoginDto): Promise<string> {
    return this.rpc('user.login', userLoginDto);
  }

  getUsers(ids: number[]): Promise<(UserContract | undefined)[]> {
    return this.rpc('user.get', ids);
  }
}
