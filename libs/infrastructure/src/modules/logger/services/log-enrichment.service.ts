import { LogEntry } from '../contracts/log.entry';
import { LogParams } from '../logger.service';
import { ConfigurationService } from '../../configuration/configuration.service';
import { EnvSchema } from '../../../configs/configuration/schemas/env.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogEnrichmentService {
  private readonly serviceName: string;

  constructor(configurationService: ConfigurationService) {
    const section = configurationService.get(EnvSchema);
    this.serviceName = section.serviceName;
  }

  enrich(target: LogParams): Promise<LogEntry> {
    const result: LogEntry = {
      ...target,
      serviceName: this.serviceName,
      timestamp: new Date(),
    };
    return Promise.resolve(result);
  }
}
