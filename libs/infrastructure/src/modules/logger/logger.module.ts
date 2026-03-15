import { forwardRef, Module } from '@nestjs/common';
import { EventBusModule } from '@app/infrastructure/modules/event-bus/event-bus.module';
import { ConfigurationModule } from '@app/infrastructure/modules/configuration/configuration.module';
import { LoggerLoader } from '@app/infrastructure/modules/logger/logger.loader';
import {
  LoggerService,
  LoggerServiceDependencies,
} from '@app/infrastructure/modules/logger/logger.service';
import { LogEnrichmentService } from '@app/infrastructure/modules/logger/services/log-enrichment.service';

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
