import { type LogBuffer } from '@app/infrastructure/modules/logger/buffer/buffer.interface';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { type Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEnrichmentService } from '@app/infrastructure/modules/logger/services/log-enrichment.service';
import { Injectable } from '@nestjs/common';
import { ConsoleSink } from '@app/infrastructure/configs/logger/sinks/console.sink';
import { MemoryBuffer } from '@app/infrastructure/configs/logger/buffers/memory.buffer';

export interface LogParams {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

@Injectable()
export class LoggerServiceDependencies {
  public sink: Sink = new ConsoleSink();
  public buffer: LogBuffer = new MemoryBuffer();

  constructor(public enrichmentService: LogEnrichmentService) {}
}

@Injectable()
export class LoggerService {
  private flushing = false;

  constructor(private readonly dependencies: LoggerServiceDependencies) {}

  async log(params: LogParams): Promise<void> {
    const entry = await this.dependencies.enrichmentService.enrich(params);
    const accepted = this.dependencies.buffer.write(entry);
    if (!accepted) {
      await this.dependencies.sink.emit(entry);
    }
  }

  async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    try {
      await this.dependencies.buffer.flush(this.dependencies.sink);
    } finally {
      this.flushing = false;
    }
  }
}
