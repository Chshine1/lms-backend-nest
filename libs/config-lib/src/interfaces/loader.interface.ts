import { ClassConstructor } from 'class-transformer';

export interface ConfigurationLoader {
  load(
    loadedConfig: unknown,
    dependencies: ClassConstructor<unknown>[],
    target: ClassConstructor<unknown>,
  ): Promise<Record<string, unknown>>;
}
