import { LoaderMiddlewareBase } from '../../../modules/configuration/pipeline/loader.middleware';
import { promises } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { merge } from 'lodash';
import { EnvSchema } from '../schemas/env.schema';

export class YamlLoader extends LoaderMiddlewareBase<[EnvSchema]> {
  protected async load(
    dependencies: [EnvSchema],
  ): Promise<Record<string, unknown>> {
    const env = dependencies[0];

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

      if (loadedYaml === null || loadedYaml === undefined) continue;
      if (typeof loadedYaml !== 'object' || Array.isArray(loadedYaml)) {
        throw new Error(
          `YAML file "${path}" must contain a configuration object (not array or scalar)`,
        );
      }

      loadedPart = merge(loadedPart, loadedYaml);
    }

    return loadedPart;
  }
}
