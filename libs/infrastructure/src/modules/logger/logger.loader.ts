import { LoggerServiceDependencies } from './logger.service';
import { ConsoleSink } from '../../configs/logger/sinks/console.sink';
import { MemoryBuffer } from '../../configs/logger/buffers/memory.buffer';
import { ConfigurationService } from '../configuration/configuration.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LoggerLibConfig } from '@app/contracts';
import { BootstrapEventBus } from '../event-bus/event-bus.module';

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
    this.configurationService.getByKey('logger', LoggerLibConfig);

    this.serviceDependencies.sink = new ConsoleSink('console-sink');
    this.serviceDependencies.buffer = new MemoryBuffer();
    this.ready = true;
  }

  get isReady(): boolean {
    return this.ready;
  }
}
