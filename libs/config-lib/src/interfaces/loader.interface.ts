import { ClassConstructor } from 'class-transformer';

export interface ConfigLoader {
  load(
    last: unknown,
    depSchemas: ClassConstructor<unknown>[],
    returnSchema: ClassConstructor<unknown>,
  ): Promise<object>;
}
