import { ValidationError } from 'class-validator';
import { ClassConstructor } from 'class-transformer';
import { ErrorCode } from '@app/contracts';
import { ConfigurationError } from './configuration.error';

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
