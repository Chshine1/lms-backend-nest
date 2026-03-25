import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { FileService } from './file.service';
import { FileContract } from '@app/contracts/file/entities/file.contract';
import { CreateFileDto } from '@app/contracts/file/dto/create-file.dto';
import { SignedUrlResult } from '@app/contracts/file/dto/signed-url.result';
import { ExtractController } from '@app/typed-client/types/extract.controller';
import { FileTypedClient } from '@app/typed-client/clients/file.typed-client';

@Controller()
export class FileController implements ExtractController<FileTypedClient> {
  constructor(private readonly fileService: FileService) {}

  @RabbitRPC({
    exchange: 'file-service',
    routingKey: 'file.create',
    queue: 'file-service-file-create',
  })
  createFile(dto: CreateFileDto): Promise<FileContract> {
    return this.fileService.createFile(dto, undefined as never);
  }

  @RabbitRPC({
    exchange: 'file-service',
    routingKey: 'file.getById',
    queue: 'file-service-file-getById',
  })
  getFileById(data: { id: number }): Promise<FileContract> {
    return this.fileService.getFile(data.id);
  }

  @RabbitRPC({
    exchange: 'file-service',
    routingKey: 'file.delete',
    queue: 'file-service-file-delete',
  })
  deleteFile(data: { id: number; userId: number }): Promise<void> {
    return this.fileService.deleteFile(data.id, data.userId);
  }

  @RabbitRPC({
    exchange: 'file-service',
    routingKey: 'file.getSignedUrl',
    queue: 'file-service-file-getSignedUrl',
  })
  getSignedUrl(data: {
    id: number;
    expiresIn?: number;
  }): Promise<SignedUrlResult> {
    return this.fileService.generateSignedUrl(data.id, data.expiresIn);
  }
}
