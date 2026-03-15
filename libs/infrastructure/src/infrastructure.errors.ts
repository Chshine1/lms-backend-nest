import { BaseError } from '@app/contracts/errors/base-error';
import { ClassConstructor } from 'class-transformer';
import { ErrorCode } from '@app/contracts/errors/error.codes';
import { ValidationError } from '@nestjs/common';

export class InfrastructureError extends BaseError {}

export class ConfigLoadPipelineMiddlewareError extends InfrastructureError {
  constructor(
    public readonly middleware: ClassConstructor<object>,
    cause: unknown,
  ) {
    super(
      `Config pipeline breaks when loaded by the middleware: ${middleware.name}`,
      ErrorCode.CONFIG_LOAD_PIPELINE_MIDDLEWARE_ERROR,
      {
        middleware: middleware.name,
      },
      cause instanceof Error ? cause : new Error(String(cause)),
    );
  }
}

export class ConfigLoadPipelineValidationError extends InfrastructureError {
  constructor(
    public readonly middleware: ClassConstructor<object>,
    public readonly location:
      | { type: 'dependencies'; dependency: ClassConstructor<object> }
      | { type: 'target' },
    public readonly validationErrors: ValidationError[],
  ) {
    super(
      `Config pipeline breaks when validating configs at the middleware: ${middleware.name}`,
      ErrorCode.CONFIG_LOAD_PIPELINE_VALIDATION_ERROR,
      {
        middleware: middleware.name,
        location:
          location.type === 'dependencies'
            ? {
                type: 'dependencies',
                dependency: location.dependency.name,
              }
            : { type: 'target' },
        validationErrors,
      },
    );
  }
}
