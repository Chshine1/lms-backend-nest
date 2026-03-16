import { BaseError } from '@app/contracts/errors/base-error';
import { ClassConstructor } from 'class-transformer';
import { ValidationError } from '@nestjs/common';
import { ErrorCode } from '@app/contracts/errors/error.codes';

export class ConfigurationError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

export class GetConfigValidationError extends ConfigurationError<{
  configurationSection: string;
  validationErrors: ValidationError[];
}> {
  constructor(
    public readonly configurationSection: ClassConstructor<object>,
    public readonly validationErrors: ValidationError[],
  ) {
    super(
      `Failed to validate when getting the configuration section: ${configurationSection.name}`,
      ErrorCode.GET_CONFIG_VALIDATION_ERROR,
      {
        configurationSection: configurationSection.name,
        validationErrors,
      },
    );
  }
}
