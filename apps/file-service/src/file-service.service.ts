import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { FileContract } from '@app/contracts/file/entities/file.contract';
import {
  CreateFileDto,
  FileFilterDto,
  SignedUrlResult,
  StorageRef,
} from './dto/file.dto';
import { STORAGE_TOKEN } from './storage/storage.module';
import type { IStorageProvider } from './storage/interfaces/storage-provider.interface';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FileService implements OnModuleInit {
  private readonly defaultSignedUrlExpiry: number;

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @Inject(STORAGE_TOKEN)
    private storageProvider: IStorageProvider,
  ) {
    this.defaultSignedUrlExpiry =
      Number(process.env['SIGNED_URL_EXPIRY']) || 3600;
  }

  async onModuleInit(): Promise<void> {
    console.log('FileService initialized');
  }

  async createFile(dto: CreateFileDto): Promise<FileContract> {
    const file = this.fileRepository.create({
      storageKey: dto.storageKey,
      contentType: dto.contentType,
      size: dto.size,
      checksum: dto.checksum,
      createdBy: dto.createdBy,
    });
    const result = await this.fileRepository.save(file);
    return plainToInstance(FileContract, result, {
      excludeExtraneousValues: true,
    });
  }

  async getFile(id: number): Promise<FileContract> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return plainToInstance(FileContract, file, {
      excludeExtraneousValues: true,
    });
  }

  async listFiles(
    filters: FileFilterDto,
  ): Promise<{ files: FileContract[]; total: number }> {
    const qb = this.fileRepository.createQueryBuilder('file');

    if (filters.contentType) {
      qb.andWhere('file.contentType = :contentType', {
        contentType: filters.contentType,
      });
    }
    if (filters.createdBy) {
      qb.andWhere('file.createdBy = :createdBy', {
        createdBy: filters.createdBy,
      });
    }

    const total = await qb.getCount();

    if (filters.limit) {
      qb.take(filters.limit);
    }
    if (filters.offset) {
      qb.skip(filters.offset);
    }

    const files = await qb.getMany();
    return {
      files: files.map((f) =>
        plainToInstance(FileContract, f, { excludeExtraneousValues: true }),
      ),
      total,
    };
  }

  async deleteFile(id: number, _userId: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
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

  async getStorageRef(fileId: number): Promise<StorageRef> {
    const file = await this.getFile(fileId);
    const url = this.storageProvider.getPublicUrl(file.storageKey);
    return {
      provider: 'local',
      key: file.storageKey,
      url,
    };
  }
}
