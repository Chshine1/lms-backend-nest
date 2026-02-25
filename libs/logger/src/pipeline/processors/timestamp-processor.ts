import { Injectable } from '@nestjs/common';
import {
  LogProcessor,
  LogEntry,
} from '../../interfaces/log-pipeline.interface';

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
    return true; // 可以处理所有日志条目
  }
}
