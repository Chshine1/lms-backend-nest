import { BaseError } from '@app/contracts/errors/base-error';
import { ClassConstructor } from 'class-transformer';
import { ErrorCode } from '@app/contracts/errors/error.codes';
import { ValidationError } from '@nestjs/common';

export class InfrastructureError<
  TContext extends Record<string, unknown>,
> extends BaseError<TContext> {}

export class ConfigLoadPipelineMiddlewareError extends InfrastructureError<{
  middleware: string;
}> {
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
      cause,
    );
  }
}

export class ConfigLoadPipelineValidationError extends InfrastructureError<{
  middleware: string;
  location: { type: 'dependencies'; dependency: string } | { type: 'target' };
  validationErrors: ValidationError[];
}> {
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
