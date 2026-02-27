import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerBootstrapService {
  private readonly logLevels = ['fatal', 'error', 'warn', 'info', 'debug'];
  private currentLevel = 'info';

  fatal(message: string, metadata?: Record<string, unknown>): void {
    this.log('fatal', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  setLevel(level: string): void {
    if (this.logLevels.includes(level)) {
      this.currentLevel = level;
    }
  }

  getLevel(): string {
    return this.currentLevel;
  }

  private log(
    level: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    const levelIndex = this.logLevels.indexOf(level);
    const currentLevelIndex = this.logLevels.indexOf(this.currentLevel);

    if (levelIndex <= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        ...metadata,
      };

      console.log(JSON.stringify(logEntry));
    }
  }

  child(metadata: Record<string, unknown>): LoggerBootstrapService {
    const childLogger = new LoggerBootstrapService();
    childLogger.currentLevel = this.currentLevel;

    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (
      level: string,
      message: string,
      childMetadata?: Record<string, unknown>,
    ): void => {
      const mergedMetadata = { ...metadata, ...childMetadata };
      originalLog(level, message, mergedMetadata);
    };

    return childLogger;
  }
}
