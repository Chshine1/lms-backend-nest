import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { ConsoleSink } from '@app/infrastructure/configs/logger/sinks/console.sink';
import { MemoryBuffer } from '@app/infrastructure/configs/logger/buffers/memory.buffer';
import { Sink } from '@app/infrastructure/modules/logger/pipeline/middlewares.interface';
import { LogBuffer } from '@app/infrastructure/modules/logger/buffer/buffer.interface';
import { PipelineSink } from '@app/infrastructure/configs/logger/sinks/pipeline.sink';
import { ModuleLoader } from '@app/infrastructure/modules/module-loader.interface';

export class LoggerLoader implements ModuleLoader {
  private readonly loggerService: LoggerService;
  private ready: boolean = false;

  private serviceInnerSink: Sink;
  private serviceInnerBuffer: LogBuffer;

  constructor(consoleSink: ConsoleSink, memoryBuffer: MemoryBuffer) {
    this.serviceInnerSink = consoleSink;
    this.serviceInnerBuffer = memoryBuffer;

    this.loggerService = new LoggerService(
      this.serviceInnerSink,
      this.serviceInnerBuffer,
    );
  }

  async load(): Promise<void> {
    this.serviceInnerSink = new PipelineSink();
    this.serviceInnerBuffer = new MemoryBuffer();
    this.ready = true;
    return Promise.resolve();
  }

  get service(): LoggerService {
    return this.loggerService;
  }

  get isReady(): boolean {
    return this.ready;
  }
}
