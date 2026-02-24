import { promises } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { merge } from 'lodash';
import { ConfigurationLoader } from '@app/config-lib/interfaces/loader.interface';
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

export class YamlLoader implements ConfigurationLoader {
  async load(
    loadedConfig: unknown,
    dependencies: [ClassConstructor<EnvSchema>],
    target: ClassConstructor<YamlSchema>,
  ): Promise<Record<string, unknown>> {
    const env = plainToInstance(dependencies[0], loadedConfig, {
      excludeExtraneousValues: true,
    });

    const depsValidationErrors = await validate(env);
    if (depsValidationErrors.length > 0) {
      throw new Error(formatValidationErrors(depsValidationErrors));
    }

    if (env.configBasePath === undefined) return {};

    const basePath = env.configBasePath;
    const paths: string[] = [
      `${basePath}/${env.environment}/global.yaml`,
      `${basePath}/${env.environment}/${env.serviceName}.yaml`,
    ];

    let loadedPart: Record<string, unknown> = {};

    for (const path of paths) {
      const content = await promises.readFile(path, 'utf8');
      const loadedYaml = loadYaml(content);

      if (
        typeof loadedYaml !== 'object' ||
        loadedYaml === null ||
        Array.isArray(loadedYaml)
      ) {
        throw new ConfigError(
          `YAML file "${path}" must contain a configuration object (not array or scalar)`,
          ConfigErrorCode.LoaderFailed,
        );
      }

      loadedPart = merge(loadedPart, loadedYaml);
    }

    const result = plainToInstance(target, loadedPart, {
      excludeExtraneousValues: true,
    });

    const targetValidationErrors = await validate(result);
    if (targetValidationErrors.length > 0) {
      throw new Error(formatValidationErrors(targetValidationErrors));
    }

    return instanceToPlain(result);
  }
}
