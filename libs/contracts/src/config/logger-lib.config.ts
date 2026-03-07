import { IsBoolean, IsDefined, IsEnum, IsOptional } from 'class-validator';
import { LogLevel } from '@app/logger/abstractions/log-entry.interface';

export class LoggerLibConfig {
  @IsDefined()
  @IsEnum(LogLevel)
  level!: LogLevel;

  @IsOptional()
  @IsBoolean()
  prettyPrint?: boolean;
}
