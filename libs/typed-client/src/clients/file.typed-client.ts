import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import { CreateFileDto, FileContract, SignedUrlResult } from '@app/contracts';
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

  createFile(data: CreateFileDto): Promise<FileContract> {
    return this.rpc('file.create', data);
  }

  getFileById(data: { id: number }): Promise<FileContract> {
    return this.rpc('file.getById', data);
  }

  deleteFile(data: { id: number; userId: number }): Promise<void> {
    return this.rpc('file.delete', data);
  }

  getSignedUrl(data: {
    id: number;
    expiresIn?: number;
  }): Promise<SignedUrlResult> {
    return this.rpc('file.getSignedUrl', {
      id: data.id,
      ...(data.expiresIn !== undefined && { expiresIn: data.expiresIn }),
    });
  }
}
