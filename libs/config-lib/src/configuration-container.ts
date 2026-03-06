import { ClassConstructor, plainToInstance } from 'class-transformer';

export class ConfigurationContainer {
  constructor(private readonly config: Record<string, unknown>) {}

  get<T extends object>(section: ClassConstructor<T>): T {
    return plainToInstance(section, this.config, {
      excludeExtraneousValues: true,
    });
  }
}
