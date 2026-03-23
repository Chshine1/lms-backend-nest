import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { FileContract } from '@app/contracts/file/entities/file.contract';
import { plainToInstance } from 'class-transformer';
import {
  type IStorageProvider,
  STORAGE_PROVIDER_TOKEN,
} from '@/file-service/src/storage/storage-provider.interface';
import { CreateFileDto } from '@app/contracts/file/dto/create-file.dto';
import { SignedUrlResult } from '@app/contracts/file/dto/signed-url.result';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { FileConfig } from '@app/contracts/config/file.config';

@Injectable()
export class FileService {
  private readonly defaultSignedUrlExpiry: number;

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private storageProvider: IStorageProvider,
    private configurationService: ConfigurationService,
  ) {
    this.defaultSignedUrlExpiry =
      this.configurationService.get(FileConfig).signedUrlExpiry || 3600;
  }

  async createFile(
    dto: CreateFileDto,
    file: Express.Multer.File,
  ): Promise<FileContract> {
    // TODO: Verify checksum here
    const key = await this.storageProvider.upload(file.stream, {
      contentType: file.mimetype,
      size: file.size,
    });
    const fileRef = this.fileRepository.create({
      storageKey: key,
      contentType: file.mimetype,
      size: file.size,
      checksum: dto.checksum,
      createdBy: dto.createdBy,
    });
    const result = await this.fileRepository.save(fileRef);
    return plainToInstance(FileContract, result, {
      excludeExtraneousValues: true,
    });
  }

  async getFile(id: number): Promise<FileContract> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with id ${id.toString()} not found`);
    }
    return plainToInstance(FileContract, file, {
      excludeExtraneousValues: true,
    });
  }

  async deleteFile(id: number, _userId: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with id ${id.toString()} not found`);
    }
    await this.fileRepository.softDelete(id);
    await this.storageProvider.delete(file.storageKey);
  }

  async generateSignedUrl(
    fileId: number,
    expiresIn?: number,
  ): Promise<SignedUrlResult> {
    const file = await this.getFile(fileId);
    const expiry = expiresIn || this.defaultSignedUrlExpiry;
    const result = await this.storageProvider.generateSignedUrl(
      file.storageKey,
      expiry,
    );
    return {
      url: result.url,
      expiresAt: result.expiresAt,
    };
  }
}
