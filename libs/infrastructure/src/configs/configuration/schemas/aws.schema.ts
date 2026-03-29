import { IsDefined, ValidateNested } from 'class-validator';
import {
  DatabaseConfig,
  FileConfig,
  JwtConfig,
  LoggerLibConfig,
  RabbitMQConfig,
  StorageConfig,
} from '@app/contracts';
import { Expose, Type } from 'class-transformer';

export class AwsSchema {
  @IsDefined()
  @Type(() => JwtConfig)
  @ValidateNested()
  @Expose()
  jwt!: JwtConfig;

  @IsDefined()
  @Type(() => LoggerLibConfig)
  @ValidateNested()
  @Expose()
  logger!: LoggerLibConfig;

  @IsDefined()
  @Type(() => DatabaseConfig)
  @ValidateNested()
  @Expose()
  database!: DatabaseConfig;

  @IsDefined()
  @Type(() => RabbitMQConfig)
  @ValidateNested()
  @Expose()
  rabbitmq!: RabbitMQConfig;

  @IsDefined()
  @Type(() => StorageConfig)
  @ValidateNested()
  @Expose()
  storage!: StorageConfig;

  @IsDefined()
  @Type(() => FileConfig)
  @ValidateNested()
  @Expose()
  file!: FileConfig;
}
