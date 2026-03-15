import { LogBuffer } from '@app/infrastructure/modules/logger/buffer/buffer.interface';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEnrichmentService } from '@app/infrastructure/modules/logger/services/log-enrichment.service';

export interface LogParams {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export class LoggerService {
  private flushing = false;

  constructor(
    private readonly enrichmentService: LogEnrichmentService,
    private readonly sink: Sink,
    private readonly buffer: LogBuffer,
  ) {}

  async log(params: LogParams): Promise<void> {
    const entry = await this.enrichmentService.enrich(params);
    const accepted = this.buffer.write(entry);
    if (!accepted) {
      await this.sink.emit(entry);
    }
  }

  async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    try {
      await this.buffer.flush(this.sink);
    } finally {
      this.flushing = false;
    }
  }
}
