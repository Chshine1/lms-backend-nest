import { Readable } from 'stream';

export interface UploadOptions {
  contentType: string;
  size: number;
}

export interface IStorageProvider {
  upload(
    stream: Readable,
    options: UploadOptions,
  ): Promise<{ key: string; url?: string }>;
  delete(key: string): Promise<void>;
  generateSignedUrl(
    key: string,
    expiresIn: number,
  ): Promise<{ url: string; expiresAt: Date }>;
  getPublicUrl(key: string): string;
}
