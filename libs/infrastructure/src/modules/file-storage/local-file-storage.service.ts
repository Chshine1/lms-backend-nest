import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { StorageProviderType, StorageConfig } from '@app/contracts';
import { IFileStorageStrategy, FileMetadata } from './file-storage.interface';

@Injectable()
export class LocalFileStorageService implements IFileStorageStrategy {
  private readonly storagePath: string;

  constructor(private readonly config: StorageConfig) {
    this.storagePath = this.config.storagePath;
  }

  async upload(buffer: Buffer, metadata: FileMetadata): Promise<string> {
    const fileKey = this.generateFileKey(metadata.fileName);
    const filePath = path.join(this.storagePath, fileKey);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return fileKey;
  }

  async getUrl(fileKey: string): Promise<string> {
    return `/storage/uploads/${fileKey}`;
  }

  async delete(fileKey: string): Promise<void> {
    const filePath = path.join(this.storagePath, fileKey);
    await fs.unlink(filePath);
  }

  getProvider(): StorageProviderType {
    return StorageProviderType.LOCAL;
  }

  private generateFileKey(originalName: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    return `${timestamp}-${random}${ext}`;
  }
}
