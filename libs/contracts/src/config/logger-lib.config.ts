import { IsBoolean, IsDefined, IsEnum, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

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
