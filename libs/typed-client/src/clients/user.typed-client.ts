import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { UserPatterns } from '../patterns/user.patterns';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super('user-service', amqpConnection, userContextService, options);
  }
}
