import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { FileContract } from '@app/contracts/file/entities/file.contract';
import { CreateFileDto } from '@app/contracts/file/dto/create-file.dto';
import { SignedUrlResult } from '@app/contracts/file/dto/signed-url.result';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '@app/typed-client/typed-client.module';
import { FilePatterns } from '@app/typed-client/patterns/file.patterns';

@Injectable()
export class FileTypedClient extends TypedClientBase<FilePatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, options);
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
