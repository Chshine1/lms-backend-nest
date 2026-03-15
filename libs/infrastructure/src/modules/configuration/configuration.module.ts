import { forwardRef, Module } from '@nestjs/common';
import {
  configurationLoadersMiddlewaresToken,
  LoaderPipelineService,
} from '@app/infrastructure/modules/configuration/pipeline/loader-pipeline.service';
import { loaderPipelineMiddleware } from '@app/infrastructure/configs/configuration/loader-pipeline.middlewares';
import { EventBusModule } from '@app/infrastructure/modules/event-bus/event-bus.module';
import { ConfigurationLoader } from '@app/infrastructure/modules/configuration/configuration.loader';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';
import { LoggerModule } from '@app/infrastructure/modules/logger/logger.module';

@Module({
  imports: [EventBusModule, forwardRef(() => LoggerModule)],
  providers: [
    {
      provide: configurationLoadersMiddlewaresToken,
      useValue: loaderPipelineMiddleware,
    },
    LoaderPipelineService,
    ConfigurationLoader,
    {
      provide: ConfigurationService,
      useFactory: (loader: ConfigurationLoader): ConfigurationService => {
        return loader.service;
      },
      inject: [ConfigurationLoader],
    },
  ],
  exports: [ConfigurationLoader, ConfigurationService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigurationModule {}
