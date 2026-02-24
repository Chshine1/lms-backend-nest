import { IsBoolean, IsDefined, IsEnum, IsOptional } from 'class-validator';

export enum LogLevel {
  fatal = 'fatal',
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
  trace = 'trace',
}

export class LoggerLibConfig {
  @IsDefined()
  @IsEnum(LogLevel)
  level!: LogLevel;

  @IsOptional()
  @IsBoolean()
  prettyPrint?: boolean;
}
