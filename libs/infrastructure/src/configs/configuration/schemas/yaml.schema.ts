import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { DatabaseConfig, RabbitMQConfig } from '../../../infrastructure.module';

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

export class YamlSchema {
  @IsOptional()
  @IsBoolean()
  @Expose()
  skipAws?: boolean;

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
