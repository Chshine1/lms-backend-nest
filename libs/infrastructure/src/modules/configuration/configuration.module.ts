import { Module } from '@nestjs/common';
import {
  configurationLoadersMiddlewaresToken,
  LoaderPipelineService,
} from './pipeline/loader-pipeline.service';
import { loaderPipelineMiddleware } from '../../configs/configuration/loader-pipeline.middlewares';
import { ConfigurationService } from './configuration.service';

@Module({
  providers: [
    {
      provide: configurationLoadersMiddlewaresToken,
      useValue: loaderPipelineMiddleware,
    },
    LoaderPipelineService,
    {
      provide: ConfigurationService,
      useFactory: async (
        pipeline: LoaderPipelineService,
      ): Promise<ConfigurationService> => {
        const configuration = await pipeline.process({});
        return new ConfigurationService(configuration);
      },
      inject: [LoaderPipelineService],
    },
  ],
  exports: [ConfigurationService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigurationModule {}
