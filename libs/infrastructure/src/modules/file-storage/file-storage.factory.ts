import { Injectable } from '@nestjs/common';
import { StorageProviderType, StorageConfig } from '@app/contracts';
import { IFileStorageStrategy, FileMetadata } from './file-storage.interface';
import { LocalFileStorageService } from './local-file-storage.service';

@Injectable()
export class FileStorageService implements IFileStorageStrategy {
  private readonly strategy: IFileStorageStrategy;

  constructor(
    private readonly config: StorageConfig,
    private readonly localStorage: LocalFileStorageService,
  ) {
    this.strategy = this.resolveStrategy();
  }

  private resolveStrategy(): IFileStorageStrategy {
    switch (this.config.provider) {
      case StorageProviderType.OSS:
      case StorageProviderType.S3:
        return this.localStorage;
      case StorageProviderType.LOCAL:
      default:
        return this.localStorage;
    }
  }

  async upload(buffer: Buffer, metadata: FileMetadata): Promise<string> {
    return this.strategy.upload(buffer, metadata);
  }

  async getUrl(fileKey: string): Promise<string> {
    return this.strategy.getUrl(fileKey);
  }

  async delete(fileKey: string): Promise<void> {
    return this.strategy.delete(fileKey);
  }

  getProvider(): StorageProviderType {
    return this.strategy.getProvider();
  }
}
