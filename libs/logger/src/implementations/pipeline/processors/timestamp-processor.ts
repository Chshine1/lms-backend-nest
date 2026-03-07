import { Injectable } from '@nestjs/common';
import { LogProcessor } from '@app/logger/abstractions/logger-pipeline.abstraction';
import { LogEntry } from '@app/logger/abstractions/log-entry.interface';

@Injectable()
export class TimestampProcessor implements LogProcessor {
  process(logEntry: LogEntry): Promise<LogEntry> {
    try {
      return Promise.resolve({
        ...logEntry,
        metadata: {
          ...logEntry.metadata,
          processedAt: new Date().toISOString(),
          processingTime: Date.now() - logEntry.timestamp.getTime(),
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to process timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  canProcess(_logEntry: LogEntry): boolean {
    return true;
  }
}
