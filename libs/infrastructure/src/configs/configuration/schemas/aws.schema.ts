import { IsDefined, IsObject, ValidateNested } from 'class-validator';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { Type } from 'class-transformer';
import { JwtConfig } from '@app/contracts/config/jwt.config';

export class AwsSchema {
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => JwtConfig)
  jwt!: JwtConfig;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => LoggerLibConfig)
  logger!: LoggerLibConfig;
}
