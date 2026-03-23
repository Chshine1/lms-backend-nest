import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';
import {
  IStorageProvider,
  UploadOptions,
} from '@/file-service/src/storage/storage-provider.interface';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { StorageConfig, S3Config } from '@app/contracts/config/storage.config';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly s3Client: S3Client;
  private readonly s3Config: S3Config;

  constructor(private readonly configurationService: ConfigurationService) {
    const storageConfig = this.configurationService.get(StorageConfig);
    if (storageConfig.s3 === undefined) {
      // TODO: Not enough error handling
      throw new Error();
    }
    this.s3Config = storageConfig.s3;

    this.s3Client = new S3Client({
      region: this.s3Config.region,
      credentials: {
        accessKeyId: this.s3Config.accessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey,
      },
      endpoint: this.s3Config.endpoint,
      forcePathStyle: !!this.s3Config.endpoint,
    });
  }

  async upload(stream: Readable, options: UploadOptions): Promise<string> {
    const key = this.generateKey(options.contentType);

    const command = new PutObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: key,
      Body: stream,
      ContentType: options.contentType,
      ContentLength: options.size,
    });

    await this.s3Client.send(command);

    return key;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async generateSignedUrl(
    key: string,
    expiresIn: number,
  ): Promise<{ url: string; expiresAt: Date }> {
    const command = new GetObjectCommand({
      Bucket: this.s3Config.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresIn,
    });

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return { url, expiresAt };
  }

  getPublicUrl(key: string): string {
    return `https://${this.s3Config.bucket}.s3.${this.s3Config.region}.amazonaws.com/${key}`;
  }

  private generateKey(contentType: string): string {
    const ext = this.getExtension(contentType);
    const date = new Date();
    const datePath = `${date.getFullYear().toString()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    const uniqueId = crypto.randomUUID();
    return `${datePath}/${uniqueId}${ext}`;
  }

  private getExtension(contentType: string): string {
    const mimeTypes: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'video/mp4': '.mp4',
      'audio/mpeg': '.mp3',
      'text/plain': '.txt',
      'application/json': '.json',
    };
    return mimeTypes[contentType] || '';
  }
}
