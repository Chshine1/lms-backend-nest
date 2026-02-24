import { LoaderRegistry } from '@app/config-lib/interfaces/loader-options.interface';
import { EnvLoader } from '@app/config-lib/loaders/env.loader';
import { YamlLoader } from '@app/config-lib/loaders/yaml.loader';
import { AwsLoader } from '@app/config-lib/loaders/aws.loader';
import { EnvSchema } from '@app/config-lib/schemas/env.schema';
import { YamlSchema } from '@app/config-lib/schemas/yaml.schema';
import { AwsSchema } from '@app/config-lib/schemas/aws.schema';

export const defaultLoaderRegistry: LoaderRegistry = {
  env: {
    loader: EnvLoader,
    deps: [],
    schema: EnvSchema,
  },

  yaml: {
    loader: YamlLoader,
    deps: [EnvSchema],
    schema: YamlSchema,
  },

  aws: {
    loader: AwsLoader,
    deps: [EnvSchema, YamlSchema],
    schema: AwsSchema,
  },
};
