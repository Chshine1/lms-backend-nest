import { type Sink } from './contracts/middlewares.interface';
import { LogEnrichmentService } from './services/log-enrichment.service';
import { Injectable } from '@nestjs/common';
import { BaseError, LogLevel } from '@app/contracts';
import { type LogBuffer } from './contracts/buffer.interface';

export interface LogParams {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: BaseError;
}

@Injectable()
export class LoggerService {
  private flushing = false;

  constructor(
    public sink: Sink,
    public buffer: LogBuffer,
    public enrichmentService: LogEnrichmentService,
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
