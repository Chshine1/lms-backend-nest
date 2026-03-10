import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

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
      throw new Error(validationErrors.join(' '));
    }

    return config;
  }
}
