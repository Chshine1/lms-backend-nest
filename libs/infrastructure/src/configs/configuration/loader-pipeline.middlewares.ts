import { LoaderMiddleware } from '@app/infrastructure/modules/configuration/pipeline/loader.middleware';
import { EnvLoader } from '@app/infrastructure/configs/configuration/loaders/env.loader';
import { EnvSchema } from '@app/infrastructure/configs/configuration/schemas/env.schema';
import { YamlLoader } from '@app/infrastructure/configs/configuration/loaders/yaml.loader';
import { YamlSchema } from '@app/infrastructure/configs/configuration/schemas/yaml.schema';
import { AwsLoader } from '@app/infrastructure/configs/configuration/loaders/aws.loader';
import { AwsSchema } from '@app/infrastructure/configs/configuration/schemas/aws.schema';

export const loaderPipelineMiddleware: LoaderMiddleware[] = [
  new EnvLoader([], EnvSchema),
  new YamlLoader([EnvSchema], YamlSchema),
  new AwsLoader([EnvSchema, YamlSchema], AwsSchema),
];
