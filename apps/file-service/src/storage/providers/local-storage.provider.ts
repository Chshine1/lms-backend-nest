import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { Readable } from 'stream';
import {
  IStorageProvider,
  UploadOptions,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly storagePath: string;

  constructor() {
    this.storagePath = process.env['STORAGE_PATH'] || '/tmp/file-storage';
    this.ensureStorageDirectory();
  }

  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async upload(
    stream: Readable,
    options: UploadOptions,
  ): Promise<{ key: string; url?: string }> {
    const key = this.generateKey(options.contentType);
    const fullPath = path.join(this.storagePath, key);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(fullPath);
    await new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on('error', reject);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return { key, url: `/files/${key}` };
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.storagePath, key);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async generateSignedUrl(
    key: string,
    expiresIn: number,
  ): Promise<{ url: string; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const signedUrl = `/files/${key}?expires=${expiresAt.getTime()}`;
    return { url: signedUrl, expiresAt };
  }

  getPublicUrl(key: string): string {
    return `/files/${key}`;
  }

  private generateKey(contentType: string): string {
    const ext = this.getExtension(contentType);
    const hash = crypto.randomUUID();
    const date = new Date();
    const datePath = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    return `${datePath}/${hash}${ext}`;
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
