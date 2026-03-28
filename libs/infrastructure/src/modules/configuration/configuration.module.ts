import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import {
  configurationLoadersMiddlewaresToken,
  LoaderPipelineService,
} from './pipeline/loader-pipeline.service';
import { loaderPipelineMiddleware } from '../../configs/configuration/loader-pipeline.middlewares';
import { EventBusModule } from '../event-bus/event-bus.module';
import { ConfigurationLoader } from './configuration.loader';
import {
  ConfigurationService,
  ConfigurationServiceDependencies,
} from './configuration.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [EventBusModule, forwardRef(() => LoggerModule)],
  providers: [
    {
      provide: configurationLoadersMiddlewaresToken,
      useValue: loaderPipelineMiddleware,
    },
    LoaderPipelineService,
    ConfigurationServiceDependencies,
    {
      provide: ConfigurationService,
      useFactory: (
        dep: ConfigurationServiceDependencies,
      ): ConfigurationService => {
        return new ConfigurationService(dep);
      },
      inject: [ConfigurationServiceDependencies],
    },
    ConfigurationLoader,
  ],
  exports: [ConfigurationLoader, ConfigurationService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigurationModule {
  static forRoot(preloadedService: ConfigurationService): DynamicModule {
    return {
      module: ConfigurationModule,
      providers: [
        {
          provide: configurationLoadersMiddlewaresToken,
          useValue: loaderPipelineMiddleware,
        },
        LoaderPipelineService,
        ConfigurationServiceDependencies,
        {
          provide: ConfigurationService,
          useValue: preloadedService,
        },
        ConfigurationLoader,
      ],
      exports: [ConfigurationLoader, ConfigurationService],
    };
  }
}
