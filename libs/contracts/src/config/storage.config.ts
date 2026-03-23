import { Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  IsEnum,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';

export enum StorageProviderType {
  LOCAL = 'local',
  S3 = 's3',
}

export class S3Config {
  @Expose()
  @IsDefined()
  @IsString()
  bucket!: string;

  @Expose()
  @IsDefined()
  @IsString()
  region!: string;

  @Expose()
  @IsOptional()
  @IsString()
  accessKeyId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  secretAccessKey?: string;

  @Expose()
  @IsOptional()
  @IsString()
  endpoint?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  signedUrlExpiry?: number;
}

export class StorageConfig {
  @Expose()
  @IsDefined()
  @IsString()
  storagePath!: string;

  @Expose()
  @IsDefined()
  @IsEnum(StorageProviderType)
  provider!: StorageProviderType;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => S3Config)
  s3?: S3Config;
}
