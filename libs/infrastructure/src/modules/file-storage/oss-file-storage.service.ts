import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { StorageProviderType, StorageConfig, S3Config } from '@app/contracts';
import { IFileStorageStrategy, FileMetadata } from './file-storage.interface';

@Injectable()
export class OssFileStorageService implements IFileStorageStrategy {
  private readonly config: StorageConfig;
  private readonly s3Config: S3Config;

  constructor(config: StorageConfig) {
    this.config = config;
    this.s3Config = config.s3!;
  }

  async upload(buffer: Buffer, metadata: FileMetadata): Promise<string> {
    const fileKey = this.generateFileKey(metadata.fileName);
    // OSS upload implementation using S3 SDK
    // This is a placeholder - actual implementation would use @aws-sdk/client-s3
    // For now, we return the fileKey
    return fileKey;
  }

  async getUrl(fileKey: string): Promise<string> {
    const expiry = this.s3Config.signedUrlExpiry ?? 3600;
    // Generate signed URL for OSS
    // This is a placeholder - actual implementation would generate a signed URL
    // using OSS SDK
    return `https://${this.s3Config.bucket}.${this.s3Config.endpoint}/${fileKey}?expires=${expiry}`;
  }

  async delete(fileKey: string): Promise<void> {
    // OSS delete implementation using S3 SDK
    // This is a placeholder - actual implementation would delete the object
  }

  getProvider(): StorageProviderType {
    return StorageProviderType.OSS;
  }

  private generateFileKey(originalName: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = originalName.split('.').pop();
    return `uploads/${timestamp}-${random}.${ext}`;
  }
}
