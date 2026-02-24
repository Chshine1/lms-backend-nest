import { IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { Type } from 'class-transformer';

export class AwsSchema {
  @IsDefined()
  @IsString()
  jwtSecret!: string;

  @IsDefined()
  @IsNumber()
  jwtExpiry!: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => LoggerLibConfig)
  logger!: LoggerLibConfig;
}
