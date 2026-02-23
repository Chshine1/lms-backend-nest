import { Inject, Injectable } from '@nestjs/common';
import { Config, ConfigObject } from './interfaces/raw-config.interface';
import { type LoaderOptions } from './interfaces/loader-options.interface';
import { ConfigError } from '@app/config-lib/utils/errors';

@Injectable()
export class ConfigLoaderService {
  constructor(@Inject('LOADERS') private readonly loaders: LoaderOptions) {}

  async load(order: (keyof LoaderOptions)[], initial: Config): Promise<Config> {
    let currentConfig = { ...initial };

    for (const loaderName of order) {
      const section = this.loaders[loaderName];
      if (!section) {
        throw new Error(
          `Loader "${String(loaderName)}" not defined in options.`,
        );
      }

      if (section.skip(currentConfig)) {
        continue;
      }

      const loaderConfig = section.config(currentConfig);
      const loaderInstance = new section.loader();

      let loadedPart: ConfigObject;
      try {
        loadedPart = await loaderInstance.load(loaderConfig);
      } catch (err) {
        if (err instanceof ConfigError) {
          continue;
        }
        throw err;
      }

      if ('environment' in loadedPart || 'serviceName' in loadedPart) {
        throw new Error(
          `Loader "${String(loaderName)}" attempted to override protected keys.`,
        );
      }

      currentConfig = {
        ...currentConfig,
        ...loadedPart,
      };
    }

    return currentConfig;
  }
}
