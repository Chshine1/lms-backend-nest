import { LoggerServiceDependencies } from '@app/infrastructure/modules/logger/logger.service';
import { ConsoleSink } from '@app/infrastructure/configs/logger/sinks/console.sink';
import { MemoryBuffer } from '@app/infrastructure/configs/logger/buffers/memory.buffer';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LoggerLibConfig } from '@app/contracts/config/logger-lib.config';
import { BootstrapEventBus } from '@app/infrastructure/modules/event-bus/event-bus.module';

@Injectable()
export class LoggerLoader {
  private ready: boolean = false;

  constructor(
    private readonly serviceDependencies: LoggerServiceDependencies,
    private readonly eventBusService: BootstrapEventBus,
    @Inject(forwardRef(() => ConfigurationService))
    private readonly configurationService: ConfigurationService,
  ) {}

  async load(): Promise<void> {
    await this.eventBusService.on('config.loaded');
    this.configurationService.get<LoggerLibConfig>(LoggerLibConfig);

    this.serviceDependencies.sink = new ConsoleSink();
    this.serviceDependencies.buffer = new MemoryBuffer();
    this.ready = true;
  }

  get isReady(): boolean {
    return this.ready;
  }
}
