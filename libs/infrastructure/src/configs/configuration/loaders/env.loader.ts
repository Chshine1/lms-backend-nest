import { camelCase } from 'change-case';
import { LoaderMiddlewareBase } from '../../../modules/configuration/pipeline/loader.middleware';

export class EnvLoader extends LoaderMiddlewareBase<[]> {
  protected load(): Promise<Record<string, unknown>> {
    const loadedPart: Record<string, unknown> = {};

    for (const key in process.env) {
      const value = process.env[key];
      if (value === undefined) continue;
      loadedPart[camelCase(key)] = value;
    }

    return Promise.resolve(loadedPart);
  }
}
