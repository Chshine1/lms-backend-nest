import { Inject, Injectable } from '@nestjs/common';
import {
  LoaderDefinition,
  type LoaderRegistry,
} from './interfaces/loader-options.interface';
import { ConfigError } from '@app/config-lib/utils/errors';

type MergeConfigSchema<
  KOrderedLoaders extends readonly (keyof LoaderRegistry)[],
> = KOrderedLoaders extends []
  ? unknown
  : KOrderedLoaders extends [infer KFirst, ...infer KRest]
    ? KFirst extends keyof LoaderRegistry
      ? LoaderRegistry[KFirst] extends LoaderDefinition<
          infer TSchema,
          unknown[]
        >
        ? TSchema &
            (KRest extends (keyof LoaderRegistry)[]
              ? MergeConfigSchema<KRest>
              : never)
        : never
      : never
    : never;

export type ConfigSchema = MergeConfigSchema<['env', 'yaml', 'aws']>;
export const LOADER_REGISTRY_TOKEN = Symbol('CONFIG_LOADER_REGISTRY');

@Injectable()
export class ConfigService {
  constructor(
    @Inject(LOADER_REGISTRY_TOKEN)
    private readonly loaderRegistry: LoaderRegistry,
  ) {}

  async load<KOrderedLoaders extends readonly (keyof LoaderRegistry)[]>(
    loaderKeys: KOrderedLoaders,
  ): Promise<MergeConfigSchema<KOrderedLoaders>> {
    let loadedConfig: object = {};

    for (let i = 0; i < loaderKeys.length; i++) {
      const loaderKey = loaderKeys[i];
      if (loaderKey === undefined) throw new Error('Unexpected out of range!');

      const loaderRegistryElement = this.loaderRegistry[loaderKey];
      let loaderPart: object;
      try {
        loaderPart = await new loaderRegistryElement.loader().load(
          loadedConfig,
          loaderRegistryElement.deps,
          loaderRegistryElement.schema,
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

    return loadedConfig as MergeConfigSchema<KOrderedLoaders>;
  }
}
