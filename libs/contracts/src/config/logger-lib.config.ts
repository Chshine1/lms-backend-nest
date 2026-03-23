import { IsBoolean, IsDefined, IsEnum, IsOptional } from 'class-validator';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Expose } from 'class-transformer';

export class LoggerLibConfig {
  @Expose()
  @IsDefined()
  @IsEnum(LogLevel)
  level!: LogLevel;

  @Expose()
  @IsOptional()
  @IsBoolean()
  prettyPrint?: boolean;
}
