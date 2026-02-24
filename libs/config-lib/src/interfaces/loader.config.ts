import { ClassConstructor } from 'class-transformer';
import { ConfigurationLoader } from './loader.interface';

type ClassConstructorList<T extends unknown[]> = T extends [
  infer First,
  ...infer Rest,
]
  ? [ClassConstructor<First>, ...ClassConstructorList<Rest>]
  : [];

export interface LoaderDefinition<
  TSchema extends object,
  TDeps extends unknown[],
> {
  loader: ClassConstructor<ConfigurationLoader>;
  deps: ClassConstructorList<TDeps>;
  schema: ClassConstructor<TSchema>;
}
