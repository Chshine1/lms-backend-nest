import { Readable } from 'stream';

export interface UploadOptions {
  contentType: string;
  size: number;
}

export const STORAGE_PROVIDER_TOKEN = Symbol('STORAGE_PROVIDER');

export interface IStorageProvider {
  upload(stream: Readable, options: UploadOptions): Promise<string>;
  delete(key: string): Promise<void>;
  generateSignedUrl(
    key: string,
    expiresIn: number,
  ): Promise<{ url: string; expiresAt: Date }>;
  getPublicUrl(key: string): string;
}
