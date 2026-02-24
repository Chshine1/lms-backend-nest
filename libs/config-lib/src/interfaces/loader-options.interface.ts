import { ClassConstructor } from 'class-transformer';
import { ConfigLoader } from './loader.interface';
import { EnvSchema } from '@app/config-lib/schemas/env.schema';
import { YamlSchema } from '@app/config-lib/schemas/yaml.schema';
import { AwsSchema } from '@app/config-lib/schemas/aws.schema';

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
  loader: ClassConstructor<ConfigLoader>;
  deps: ClassConstructorList<TDeps>;
  schema: ClassConstructor<TSchema>;
}

export interface LoaderOptions {
  env: LoaderDefinition<EnvSchema, []>;
  yaml: LoaderDefinition<YamlSchema, [EnvSchema]>;
  aws: LoaderDefinition<AwsSchema, [EnvSchema, YamlSchema]>;
}
