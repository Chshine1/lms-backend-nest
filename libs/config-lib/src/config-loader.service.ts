import { Inject, Injectable } from '@nestjs/common';
import {
  LoaderDefinition,
  type LoaderOptions,
} from './interfaces/loader-options.interface';
import { ConfigError } from '@app/config-lib/utils/errors';

type ExtractReturnSchema<TOrder extends readonly (keyof LoaderOptions)[]> =
  TOrder extends []
    ? unknown
    : TOrder extends [infer First, ...infer Rest]
      ? First extends keyof LoaderOptions
        ? LoaderOptions[First] extends LoaderDefinition<
            infer TSchema,
            unknown[]
          >
          ? TSchema &
              (Rest extends (keyof LoaderOptions)[]
                ? ExtractReturnSchema<Rest>
                : never)
          : never
        : never
      : never;

export type ConfigSchema = ExtractReturnSchema<['env', 'yaml', 'aws']>;

@Injectable()
export class ConfigLoaderService {
  constructor(@Inject('LOADERS') private readonly loaders: LoaderOptions) {}

  async load<TOrder extends readonly (keyof LoaderOptions)[]>(
    order: TOrder,
  ): Promise<ExtractReturnSchema<TOrder>> {
    let currentConfig: object = {};

    for (let i = 0; i < order.length; i++) {
      const loaderName = order[i];
      if (loaderName === undefined) throw new Error('Unexpected out of range!');
      const section = this.loaders[loaderName];

      let loadedPart: object;
      try {
        loadedPart = await new section.loader().load(
          currentConfig,
          section.deps,
          section.schema,
        );
      } catch (err) {
        if (err instanceof ConfigError) {
          throw err;
        }
        throw err;
      }

      currentConfig = {
        ...currentConfig,
        ...loadedPart,
      };
    }

    return currentConfig as ExtractReturnSchema<TOrder>;
  }
}
