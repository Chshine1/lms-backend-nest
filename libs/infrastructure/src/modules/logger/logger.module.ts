import { forwardRef, Module } from '@nestjs/common';
import { EventBusModule } from '../event-bus/event-bus.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import { LoggerLoader } from './logger.loader';
import { LoggerService, LoggerServiceDependencies } from './logger.service';
import { LogEnrichmentService } from './services/log-enrichment.service';

@Module({
  imports: [EventBusModule, forwardRef(() => ConfigurationModule)],
  providers: [
    LogEnrichmentService,
    LoggerServiceDependencies,
    {
      provide: LoggerService,
      useFactory: (dep: LoggerServiceDependencies): LoggerService => {
        return new LoggerService(dep);
      },
      inject: [LoggerServiceDependencies],
    },
    LoggerLoader,
  ],
  exports: [LoggerLoader, LoggerService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {}
