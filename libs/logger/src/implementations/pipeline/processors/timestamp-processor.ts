import { Injectable } from '@nestjs/common';
import { LogProcessor } from '@app/logger/abstractions/pipeline.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

@Injectable()
export class TimestampProcessor implements LogProcessor {
  process(logEntry: LogEntry): Promise<LogEntry> {
    return Promise.resolve({
      ...logEntry,
      metadata: {
        ...logEntry.metadata,
        processedAt: new Date().toISOString(),
        processingTime: Date.now() - logEntry.timestamp.getTime(),
      },
    });
  }

  canProcess(_logEntry: LogEntry): boolean {
    return true;
  }
}
