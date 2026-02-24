import { Inject, Injectable } from '@nestjs/common';
import { LoaderDefinition } from './interfaces/loader.config';
import { ConfigError } from '@app/config-lib/utils/errors';
import { MergeConfigSchema } from '@app/config-lib/interfaces/config-loader-pipeline.builder';

export const LOADER_REGISTRY_TOKEN = Symbol('CONFIG_LOADER_REGISTRY');

@Injectable()
export class ConfigurationService<
  TPipeline extends LoaderDefinition<object, unknown[]>[],
> {
  constructor(
    @Inject(LOADER_REGISTRY_TOKEN)
    private readonly loadersPipeline: TPipeline,
  ) {}

  async load(): Promise<MergeConfigSchema<TPipeline>> {
    let loadedConfig: object = {};

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

    return loadedConfig as MergeConfigSchema<TPipeline>;
  }
}
