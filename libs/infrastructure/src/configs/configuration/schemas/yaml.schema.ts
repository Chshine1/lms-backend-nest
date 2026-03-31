import {
  IsBoolean,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

import {
  DatabaseConfig,
  FileConfig,
  JwtConfig,
  RabbitMQConfig,
  StorageConfig,
} from '@app/contracts';

export class AwsConfig {
  @IsDefined()
  @IsString()
  @Expose()
  basePath!: string;

  @IsDefined()
  @IsString()
  @Expose()
  region!: string;

  @IsOptional()
  @IsBoolean()
  @Expose()
  withDecryption?: boolean;
}

export class GatewayConfig {
  @Expose()
  @IsDefined()
  @IsNumber()
  port!: number;
}

export class YamlSchema {
  @IsOptional()
  @IsBoolean()
  @Expose()
  skipAws?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => JwtConfig)
  @Expose()
  jwt?: JwtConfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => GatewayConfig)
  @Expose()
  gateway?: GatewayConfig;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => StorageConfig)
  @Expose()
  storage?: StorageConfig;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => FileConfig)
  @Expose()
  file?: StorageConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => DatabaseConfig)
  @Expose()
  database!: DatabaseConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => RabbitMQConfig)
  @Expose()
  rabbitmq!: RabbitMQConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => AwsConfig)
  @Expose()
  aws!: AwsConfig;
}
