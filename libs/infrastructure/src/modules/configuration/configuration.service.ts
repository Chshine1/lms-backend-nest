import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { Injectable } from '@nestjs/common';
import { GetConfigValidationError } from './errors/index';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configuration: Record<string, unknown>) {}

  get<TConfig extends object>(
    cls: new (...args: unknown[]) => TConfig,
  ): TConfig {
    const config = plainToInstance(cls, this.configuration, {
      excludeExtraneousValues: true,
    });

    const validationErrors = validateSync(config);
    if (validationErrors.length > 0) {
      throw new GetConfigValidationError(cls, validationErrors);
    }

    return config;
  }

  getByKey<TConfig extends object>(
    key: string,
    cls: new (...args: unknown[]) => TConfig,
  ): TConfig {
    const keyConfig = this.configuration[key];

    if (keyConfig === undefined) {
      const error = new ValidationError();

      error.property = key;
      error.constraints = { required: `${key} is required` };
      error.target = this.configuration;

      throw new GetConfigValidationError(cls, [error]);
    }

    const config = plainToInstance(cls, keyConfig, {
      excludeExtraneousValues: true,
    });

    const validationErrors = validateSync(config);
    if (validationErrors.length > 0) {
      throw new GetConfigValidationError(cls, validationErrors);
    }

    return config;
  }
}
