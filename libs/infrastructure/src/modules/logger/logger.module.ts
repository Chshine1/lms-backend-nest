import { forwardRef, Module } from '@nestjs/common';
import { EventBusModule } from '@app/infrastructure/modules/event-bus/event-bus.module';
import { ConfigurationModule } from '@app/infrastructure/modules/configuration/configuration.module';
import { LoggerLoader } from '@app/infrastructure/modules/logger/logger.loader';
import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { LogEnrichmentService } from '@app/infrastructure/modules/logger/services/log-enrichment.service';

@Module({
  imports: [EventBusModule, forwardRef(() => ConfigurationModule)],
  providers: [
    LogEnrichmentService,
    LoggerLoader,
    {
      provide: LoggerService,
      useFactory: (loader: LoggerLoader): LoggerService => {
        return loader.service;
      },
      inject: [LoggerLoader],
    },
  ],
  exports: [LoggerLoader, LoggerService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LoggerModule {}
