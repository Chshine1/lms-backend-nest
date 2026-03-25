import { Expose, Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
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
  @IsDefined()
  @IsString()
  accessKeyId!: string;

  @Expose()
  @IsDefined()
  @IsString()
  secretAccessKey!: string;

  @Expose()
  @IsDefined()
  @IsString()
  endpoint!: string;

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
