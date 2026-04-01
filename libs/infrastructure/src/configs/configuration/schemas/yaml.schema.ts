import {
  IsDefined,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

import {
  DatabaseConfig,
  FileConfig,
  HealthConfig,
  JwtConfig,
  RabbitMQConfig,
  StorageConfig,
} from '@app/contracts';

export class GatewayConfig {
  @Expose()
  @IsDefined()
  @IsNumber()
  port!: number;
}

export class YamlSchema {
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
  @Type(() => HealthConfig)
  @Expose()
  health!: HealthConfig;
}
