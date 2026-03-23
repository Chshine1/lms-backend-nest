import { IsDefined, ValidateNested } from 'class-validator';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { Type } from 'class-transformer';
import { JwtConfig } from '@app/contracts/config/jwt.config';
import { StorageConfig } from '@app/contracts/config/storage.config';
import { FileConfig } from '@app/contracts/config/file.config';

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
