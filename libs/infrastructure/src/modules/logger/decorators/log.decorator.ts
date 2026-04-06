import { SetMetadata } from '@nestjs/common';

export const LOG_METADATA_KEY = 'logging:log';

export interface LogOptions {
  context?: Record<string, unknown>;
}

export const Log = (options?: LogOptions): MethodDecorator & ClassDecorator =>
  SetMetadata(LOG_METADATA_KEY, options ?? {});
