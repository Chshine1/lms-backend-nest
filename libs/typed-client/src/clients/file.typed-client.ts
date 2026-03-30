import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '../typed-client.module';
import { FilePatterns } from '../patterns/file.patterns';
import { TraceService } from '@app/trace';

@Injectable()
export class FileTypedClient extends TypedClientBase<FilePatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, traceService, options);
  }

  validateFileExists(ids: number[]): Promise<boolean[]> {
    return this.rpc('file.validateExists', ids);
  }
}
