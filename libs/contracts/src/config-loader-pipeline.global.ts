import {
  ConfigLoaderPipelineBuilder,
  MergeConfigSchema,
} from '@app/config-lib/interfaces/config-loader-pipeline.builder';
import { EnvLoader } from '@app/config-lib/loaders/env.loader';
import { EnvSchema } from '@app/config-lib/schemas/env.schema';
import { YamlLoader } from '@app/config-lib/loaders/yaml.loader';
import { YamlSchema } from '@app/config-lib/schemas/yaml.schema';
import { AwsLoader } from '@app/config-lib/loaders/aws.loader';
import { AwsSchema } from '@app/config-lib/schemas/aws.schema';

export const globalConfigLoaderPipeline = ConfigLoaderPipelineBuilder.create()
  .append<EnvSchema, []>({
    loader: EnvLoader,
    deps: [],
    schema: EnvSchema,
  })
  .append<YamlSchema, [EnvSchema]>({
    loader: YamlLoader,
    deps: [EnvSchema],
    schema: YamlSchema,
  })
  .append<AwsSchema, [EnvSchema, YamlSchema]>({
    loader: AwsLoader,
    deps: [EnvSchema, YamlSchema],
    schema: AwsSchema,
  })
  .build();

export type GlobalConfigSchema = MergeConfigSchema<
  typeof globalConfigLoaderPipeline
>;
