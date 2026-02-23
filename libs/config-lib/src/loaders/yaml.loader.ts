import { promises } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { merge } from 'lodash';
import { ConfigLoader } from '@app/config-lib/interfaces/loader.interface';
import { ConfigObject } from '@app/config-lib/interfaces/raw-config.interface';
import { ConfigError, ConfigErrorCode } from '@app/config-lib/utils/errors';

export class YamlLoader implements ConfigLoader<{ paths: string[] }> {
  async load(options: { paths: string[] }): Promise<ConfigObject> {
    const configs: ConfigObject[] = [];
    for (const path of options.paths) {
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

    return merge({}, ...configs) as ConfigObject;
  }
}
