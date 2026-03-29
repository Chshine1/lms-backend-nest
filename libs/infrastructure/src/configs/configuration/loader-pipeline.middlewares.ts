import { LoaderMiddleware } from '../../modules/configuration/pipeline/loader.middleware';
import { EnvLoader } from './loaders/env.loader';
import { EnvSchema } from './schemas/env.schema';
import { YamlLoader } from './loaders/yaml.loader';
import { YamlSchema } from './schemas/yaml.schema';

export const loaderPipelineMiddleware: LoaderMiddleware[] = [
  new EnvLoader([], EnvSchema),
  new YamlLoader([EnvSchema], YamlSchema),
];
