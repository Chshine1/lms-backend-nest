import { promises } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { merge } from 'lodash';
import { ConfigLoader } from '@app/config-lib/interfaces/loader.interface';
import { ConfigObject } from '@app/config-lib/interfaces/raw-config.interface';
import { ConfigError, ConfigErrorCode } from '@app/config-lib/utils/errors';
import { EnvSchema } from '@app/config-lib/schemas/env.schema';
import { YamlSchema } from '@app/config-lib/schemas/yaml.schema';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { validate } from 'class-validator';
import { formatValidationErrors } from '@app/config-lib/utils/format-validation-errors.utils';

export class YamlLoader implements ConfigLoader {
  async load(
    last: unknown,
    depSchemas: [ClassConstructor<EnvSchema>],
    resultSchema: ClassConstructor<YamlSchema>,
  ): Promise<ConfigObject> {
    const env = plainToInstance(depSchemas[0], last);

    const errors = await validate(env);
    if (errors.length > 0) {
      throw new Error(formatValidationErrors(errors));
    }

    if (env.configBasePath === undefined) return {};
    const basePath = env.configBasePath;

    const paths: string[] = [
      `${basePath}/${env.environment}/global.yaml`,
      `${basePath}/${env.environment}/${env.serviceName}.yaml`,
    ];
    const configs: ConfigObject[] = [];
    for (const path of paths) {
      const content = await promises.readFile(path, 'utf8');
      const loaded = loadYaml(content);

      if (
        typeof loaded !== 'object' ||
        loaded === null ||
        Array.isArray(loaded)
      ) {
        throw new ConfigError(
          `YAML file "${path}" must contain a configuration object (not array or scalar)`,
          ConfigErrorCode.LOADER_FAILED,
          undefined,
          'YamlLoader',
        );
      }

      configs.push(loaded as ConfigObject);
    }

    const result = plainToInstance(resultSchema, merge({}, ...configs));

    const errs = await validate(result);
    if (errs.length > 0) {
      throw new Error(formatValidationErrors(errs));
    }

    return instanceToPlain(result);
  }
}
