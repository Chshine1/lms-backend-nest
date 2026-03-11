import { IsBoolean, IsDefined, IsEnum, IsOptional } from 'class-validator';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';

export class LoggerLibConfig {
  @IsDefined()
  @IsEnum(LogLevel)
  level!: LogLevel;

  @IsOptional()
  @IsBoolean()
  prettyPrint?: boolean;
}
