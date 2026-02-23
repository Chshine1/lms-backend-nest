import { ConfigLoader } from '@app/config-lib/interfaces/loader.interface';
import { ConfigObject } from '@app/config-lib/interfaces/raw-config.interface';
import { camelCase } from 'change-case';

export class EnvLoader implements ConfigLoader<void> {
  load(): Promise<ConfigObject> {
    const result: ConfigObject = {};
    for (const key in process.env) {
      const value = process.env[key];
      if (value === undefined) continue;
      result[camelCase(key)] = value;
    }
    return Promise.resolve(result);
  }
}
