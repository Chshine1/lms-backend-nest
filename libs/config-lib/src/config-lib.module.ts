import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigLoaderService } from './config-loader.service';
import { defaultLoaderOptions } from '@app/config-lib/constants/default-loader.options';
import type { LoaderOptions } from '@app/config-lib/interfaces/loader-options.interface';
import { ConfigHolder } from '@app/config-lib/config-holder';

export interface ConfigLibModuleOptions<
  TOrder extends readonly (keyof LoaderOptions)[],
> {
  order: TOrder;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigLibModule {
  static forRoot<TOrder extends readonly (keyof LoaderOptions)[]>(
    options: ConfigLibModuleOptions<TOrder>,
  ): DynamicModule {
    const loadersProvider: Provider = {
      provide: 'LOADERS',
      useValue: defaultLoaderOptions,
    };

    const loaderServiceProvider: Provider = ConfigLoaderService;

    const configHolderProvider: Provider = {
      provide: ConfigHolder,
      useFactory: async (loaderService: ConfigLoaderService) => {
        const config = await loaderService.load(options.order);
        return new ConfigHolder(config);
      },
      inject: [ConfigLoaderService],
    };

    return {
      module: ConfigLibModule,
      providers: [loadersProvider, loaderServiceProvider, configHolderProvider],
      exports: [ConfigHolder],
    };
  }
}
