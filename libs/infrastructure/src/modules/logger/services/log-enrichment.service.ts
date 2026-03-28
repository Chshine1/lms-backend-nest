import { LogEntry } from '../contracts/log.entry';
import { LogParams } from '../logger.service';
import { TraceService } from '@app/trace';
import { ConfigurationService } from '../../configuration/configuration.service';
import { EnvSchema } from '../../../configs/configuration/schemas/env.schema';

export class LogEnrichmentService {
  private readonly serviceName: string;

  constructor(
    private readonly traceService: TraceService,
    configurationService: ConfigurationService,
  ) {
    const section = configurationService.get(EnvSchema);
    this.serviceName = section.serviceName;
  }

  enrich(target: LogParams): Promise<LogEntry> {
    const result: LogEntry = {
      ...target,
      serviceName: this.serviceName,
      timestamp: new Date(),
      traceId: this.traceService.getTraceId(),
    };
    return Promise.resolve(result);
  }
}
