import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '../typed-client.module';
import { UserPatterns } from '../patterns/user.patterns';
import { TraceService } from '@app/trace';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, traceService, options);
  }

  validateUserExists(id: number[]): Promise<boolean[]> {
    return this.rpc('user.validateExists', id);
  }
}
