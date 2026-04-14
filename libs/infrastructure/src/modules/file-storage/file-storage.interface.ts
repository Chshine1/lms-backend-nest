import { StorageProviderType } from '@app/contracts';

export interface FileMetadata {
  fileKey: string;
  fileName: string;
  fileSize: bigint;
  mimeType: string;
}

export interface IFileStorageStrategy {
  upload(buffer: Buffer, metadata: FileMetadata): Promise<string>;
  getUrl(fileKey: string): Promise<string>;
  delete(fileKey: string): Promise<void>;
  getProvider(): StorageProviderType;
}
