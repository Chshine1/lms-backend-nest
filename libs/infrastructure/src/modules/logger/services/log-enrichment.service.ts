import { LogEntry } from '../contracts/log.entry';
import { LogParams } from '../logger.service';

export class LogEnrichmentService {
  enrich(target: LogParams): Promise<LogEntry> {
    const result: LogEntry = {
      ...target,
      timestamp: new Date(),
    } as LogEntry;
    return Promise.resolve(result);
  }
}
