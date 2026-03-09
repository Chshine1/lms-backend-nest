import { Module } from '@nestjs/common';
import { configurationLoadersMiddlewaresToken } from '@app/infrastructure/modules/configuration/pipeline/loader-pipeline.service';
import { loaderPipelineMiddleware } from '@app/infrastructure/configs/configuration/loader-pipeline.middlewares';
import { EventBusModule } from '@app/infrastructure/modules/event-bus/event-bus.module';
import { ConfigurationLoader } from '@app/infrastructure/modules/configuration/configuration.loader';
import { ConfigurationService } from '@app/infrastructure/modules/configuration/configuration.service';

@Module({
  imports: [EventBusModule],
  providers: [
    {
      provide: configurationLoadersMiddlewaresToken,
      useValue: loaderPipelineMiddleware,
    },
  ],
  exports: [ConfigurationLoader, ConfigurationService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigurationModule {}
