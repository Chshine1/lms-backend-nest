import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { LogParams } from '@app/infrastructure/modules/logger/logger.service';

export class LogEnrichmentService {
  enrich(target: LogParams): Promise<LogEntry> {
    const result: LogEntry = {
      ...target,
      timestamp: new Date(),
    } as LogEntry;
    return Promise.resolve(result);
  }
}
