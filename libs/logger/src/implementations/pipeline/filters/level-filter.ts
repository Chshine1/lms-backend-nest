import { Injectable } from '@nestjs/common';
import {
  LogEntry,
  LogLevel,
} from '@app/logger/abstractions/log-entry.interface';
import { LogFilter } from '@app/logger/abstractions/logger-pipeline.abstraction';

@Injectable()
export class LevelFilter implements LogFilter {
  private readonly minLevel: LogLevel;
  private readonly levelPriority: Record<LogLevel, number> = {
    [LogLevel.fatal]: 6,
    [LogLevel.error]: 5,
    [LogLevel.warn]: 4,
    [LogLevel.info]: 3,
    [LogLevel.debug]: 2,
    [LogLevel.trace]: 1,
  };

  constructor(minLevel: LogLevel = LogLevel.info) {
    this.minLevel = minLevel;
  }

  shouldLog(logEntry: LogEntry): boolean {
    try {
      const entryPriority = this.levelPriority[logEntry.level] || 0;
      const minPriority = this.levelPriority[this.minLevel] || 0;

      return entryPriority >= minPriority;
    } catch (error) {
      console.error('[LevelFilter Error]', error);
      return true;
    }
  }
}
