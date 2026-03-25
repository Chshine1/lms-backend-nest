import { IsDefined, ValidateNested } from 'class-validator';
import {
  FileConfig,
  JwtConfig,
  LoggerLibConfig,
  StorageConfig,
} from '@app/contracts';
import { Type } from 'class-transformer';

export class AwsSchema {
  @IsDefined()
  @ValidateNested()
  @Type(() => JwtConfig)
  jwt!: JwtConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => LoggerLibConfig)
  logger!: LoggerLibConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => StorageConfig)
  storage!: StorageConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => FileConfig)
  file!: FileConfig;
}
