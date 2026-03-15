import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { ConsoleSink } from '@app/infrastructure/configs/logger/sinks/console.sink';
import { MemoryBuffer } from '@app/infrastructure/configs/logger/buffers/memory.buffer';
import { LogBuffer } from '@app/infrastructure/modules/logger/buffer/buffer.interface';
import { ModuleLoader } from '@app/infrastructure/modules/module-loader.interface';
import { EventBusService } from '@app/infrastructure/modules/event-bus/event-bus.service';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEnrichmentService } from '@app/infrastructure/modules/logger/services/log-enrichment.service';

@Injectable()
export class LoggerLoader implements ModuleLoader {
  private readonly loggerService: LoggerService;
  private ready: boolean = false;

  private serviceInnerSink: Sink;
  private serviceInnerBuffer: LogBuffer;

  constructor(
    private readonly enrichmentService: LogEnrichmentService,
    private readonly eventBusService: EventBusService,
    @Inject(forwardRef(() => ConfigurationService))
    private readonly configurationService: ConfigurationService,
  ) {
    this.serviceInnerSink = new ConsoleSink();
    this.serviceInnerBuffer = new MemoryBuffer();

    this.loggerService = new LoggerService(
      this.enrichmentService,
      this.serviceInnerSink,
      this.serviceInnerBuffer,
    );
  }

  async load(): Promise<void> {
    await this.eventBusService.on('config.loaded');
    this.configurationService.get<LoggerLibConfig>(LoggerLibConfig);

    this.serviceInnerSink = new ConsoleSink();
    this.serviceInnerBuffer = new MemoryBuffer();
    this.ready = true;
  }

  get service(): LoggerService {
    return this.loggerService;
  }

  get isReady(): boolean {
    return this.ready;
  }
}
