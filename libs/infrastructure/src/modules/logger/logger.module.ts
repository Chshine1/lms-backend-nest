import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { LoggerService } from './logger.service';
import { LogEnrichmentService } from './services/log-enrichment.service';
import { ConsoleSink } from '../../configs/logger/sinks/console.sink';
import { MemoryBuffer } from '../../configs/logger/buffers/memory.buffer';
import { TraceModule } from '@app/trace';

@Module({
  imports: [TraceModule, ConfigurationModule],
  providers: [
    LogEnrichmentService,
    {
      provide: LoggerService,
      useFactory: (enrichmentService: LogEnrichmentService): LoggerService => {
        return new LoggerService(
          new ConsoleSink('console-sink-1'),
          new MemoryBuffer(),
          enrichmentService,
        );
      },
      inject: [LogEnrichmentService],
    },
  ],
  exports: [LoggerService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {}
