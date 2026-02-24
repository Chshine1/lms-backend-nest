import { ConfigLoader } from '@app/config-lib/interfaces/loader.interface';
import { ConfigObject } from '@app/config-lib/interfaces/raw-config.interface';
import { camelCase } from 'change-case';
import { EnvSchema } from '@app/config-lib/schemas/env.schema';
import { validate } from 'class-validator';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { formatValidationErrors } from '@app/config-lib/utils/format-validation-errors.utils';

export class EnvLoader implements ConfigLoader {
  async load(
    _: unknown,
    __: [],
    returnSchema: ClassConstructor<EnvSchema>,
  ): Promise<ConfigObject> {
    const result: ConfigObject = {};
    for (const key in process.env) {
      const value = process.env[key];
      if (value === undefined) continue;
      result[camelCase(key)] = value;
    }
    const r = plainToInstance(returnSchema, result);
    const errors = await validate(r);
    if (errors.length > 0) {
      throw new Error(formatValidationErrors(errors));
    }
    return instanceToPlain(r);
  }
}
