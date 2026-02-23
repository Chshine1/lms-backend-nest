import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigLoaderService } from './config-loader.service';
import { defaultLoaderOptions } from '@app/config-lib/constants/default-loader.options';
import type { LoaderOptions } from '@app/config-lib/interfaces/loader-options.interface';
import { Config } from '@app/config-lib/interfaces/raw-config.interface';

export interface ConfigLibModuleOptions {
  order: (keyof LoaderOptions)[];
  initial: Config;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigLibModule {
  static forRoot(options: ConfigLibModuleOptions): DynamicModule {
    const loadersProvider: Provider = {
      provide: 'LOADERS',
      useValue: defaultLoaderOptions,
    };

    const loaderServiceProvider: Provider = ConfigLoaderService;

    const configProvider: Provider = {
      provide: 'CONFIG',
      useFactory: (loaderService: ConfigLoaderService) => {
        return loaderService.load(options.order, options.initial);
      },
      inject: [ConfigLoaderService],
    };

    return {
      module: ConfigLibModule,
      providers: [loadersProvider, loaderServiceProvider, configProvider],
      exports: ['CONFIG'],
    };
  }
}
