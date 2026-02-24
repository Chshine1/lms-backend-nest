import { ConfigurationLoader } from '@app/config-lib/interfaces/loader.interface';
import { camelCase } from 'change-case';
import { EnvSchema } from '@app/config-lib/schemas/env.schema';
import { validate } from 'class-validator';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { formatValidationErrors } from '@app/config-lib/utils/format-validation-errors.utils';

export class EnvLoader implements ConfigurationLoader {
  async load(
    _: unknown,
    __: [],
    target: ClassConstructor<EnvSchema>,
  ): Promise<Record<string, unknown>> {
    const loadedPart: Record<string, unknown> = {};

    for (const key in process.env) {
      const value = process.env[key];
      if (value === undefined) continue;
      loadedPart[camelCase(key)] = value;
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
