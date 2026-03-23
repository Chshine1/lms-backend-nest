import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { GetConfigValidationError } from '@app/infrastructure/modules/configuration/configuration.errors';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigurationServiceDependencies {
  public configuration: Record<string, unknown> = {};
}

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly dependencies: ConfigurationServiceDependencies,
  ) {}

  get<TConfig extends object>(
    cls: new (...args: unknown[]) => TConfig,
  ): TConfig {
    const config = plainToInstance(cls, this.dependencies.configuration, {
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
    const keyConfig = this.dependencies.configuration[key];

    if (keyConfig === undefined) {
      const error = new ValidationError();

      error.property = key;
      error.constraints = { required: `${key} is required` };
      error.target = this.dependencies.configuration;

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
