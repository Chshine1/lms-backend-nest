import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { FilePatterns } from '../patterns/file.patterns';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';

@Injectable()
export class FileTypedClient extends TypedClientBase<FilePatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super('file-service', amqpConnection, userContextService, options);
  }

  validateFileExists(ids: number[]): Promise<boolean[]> {
    return this.rpc('file.validateExists', ids);
  }
}
