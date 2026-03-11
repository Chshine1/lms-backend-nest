import { BaseError } from '@app/contracts/errors/base-error';
import { ClassConstructor } from 'class-transformer';
import { ValidationError } from '@nestjs/common';
import { ErrorCode } from '@app/contracts/errors/error.codes';

export class ConfigurationError extends BaseError {}

export class GetConfigValidationError extends ConfigurationError {
  constructor(
    configurationSection: ClassConstructor<object>,
    validationErrors: ValidationError[],
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
