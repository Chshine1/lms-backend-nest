import { Inject, Injectable } from '@nestjs/common';
import { LoaderDefinition } from './interfaces/loader.config';
import { ConfigError } from '@app/config-lib/utils/errors';

export const LOADER_REGISTRY_TOKEN = Symbol('CONFIG_LOADER_REGISTRY');

@Injectable()
export class ConfigurationService<
  TPipeline extends LoaderDefinition<object, unknown[]>[],
> {
  constructor(
    @Inject(LOADER_REGISTRY_TOKEN)
    private readonly loadersPipeline: TPipeline,
  ) {}

  async load(): Promise<Record<string, unknown>> {
    let loadedConfig: Record<string, unknown> = {};

    for (const loaderDefinition of this.loadersPipeline) {
      let loaderPart: object;
      try {
        loaderPart = await new loaderDefinition.loader().load(
          loadedConfig,
          loaderDefinition.deps,
          loaderDefinition.schema,
        );
      } catch (e) {
        if (e instanceof ConfigError) throw e;
        throw e;
      }

      loadedConfig = {
        ...loadedConfig,
        ...loaderPart,
      };
    }

    return loadedConfig;
  }
}
