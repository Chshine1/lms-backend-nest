import { IsDefined, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { FileContract } from '@app/contracts/file/entities/file.contract';

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
}

export class CreateFileDto {
  @IsDefined()
  @IsString()
  storageKey!: string;

  @IsDefined()
  @IsString()
  contentType!: string;

  @IsDefined()
  @IsNumber()
  size!: number;

  @IsDefined()
  @IsString()
  checksum!: string;

  @IsDefined()
  @IsNumber()
  createdBy!: number;
}

export class FileFilterDto {
  @IsString()
  contentType?: string;

  @IsNumber()
  createdBy?: number;

  @IsNumber()
  limit?: number;

  @IsNumber()
  offset?: number;
}

export class SignedUrlDto {
  @IsDefined()
  @IsNumber()
  fileId!: number;

  @IsNumber()
  expiresIn?: number;
}

export class SignedUrlResult {
  @Expose()
  url!: string;

  @Expose()
  expiresAt!: Date;
}

export class UploadResult {
  @Expose()
  file!: FileContract;

  @Expose()
  storageRef!: StorageRef;
}

export class StorageRef {
  @Expose()
  provider!: string;

  @Expose()
  bucket?: string;

  @Expose()
  key!: string;

  @Expose()
  url?: string;
}
