import { ClassConstructor } from 'class-transformer';

export interface ConfigurationLoader {
  load(
    loadedConfig: object,
    dependencies: ClassConstructor<object>[],
    target: ClassConstructor<object>,
  ): Promise<Record<string, unknown>>;
}
