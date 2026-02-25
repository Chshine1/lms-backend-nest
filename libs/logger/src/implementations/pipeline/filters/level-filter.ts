import { Injectable } from '@nestjs/common';
import { LogLevel } from '@app/contracts/config/logger-lib.config';
import { LogEntry, LogFilter } from '@app/logger/interfaces/pipeline.interface';

@Injectable()
export class LevelFilter implements LogFilter {
  private readonly minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.info) {
    this.minLevel = minLevel;
  }

  shouldLog(logEntry: LogEntry): boolean {
    const levelPriority = {
      [LogLevel.fatal]: 6,
      [LogLevel.error]: 5,
      [LogLevel.warn]: 4,
      [LogLevel.info]: 3,
      [LogLevel.debug]: 2,
      [LogLevel.trace]: 1,
    };

    const entryPriority = levelPriority[logEntry.level] || 0;
    const minPriority = levelPriority[this.minLevel] || 0;

    return entryPriority >= minPriority;
  }
}
