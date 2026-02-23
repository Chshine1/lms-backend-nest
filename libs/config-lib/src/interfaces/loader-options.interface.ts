import { ClassConstructor } from 'class-transformer';
import { Config } from './raw-config.interface';
import { ConfigLoader } from './loader.interface';
import { YamlLoader } from '@app/config-lib/loaders/yaml.loader';
import { EnvLoader } from '@app/config-lib/loaders/env.loader';
import { AwsLoader } from '@app/config-lib/loaders/aws.loader';

export interface LoaderOptionSection<
  TLoader extends ConfigLoader<TOptions>,
  TOptions,
> {
  loader: ClassConstructor<TLoader>;
  skip: (last: Config) => boolean;
  config: (last: Config) => TOptions;
}

export interface LoaderOptions extends Record<
  string,
  LoaderOptionSection<ConfigLoader<unknown>, unknown>
> {
  env: LoaderOptionSection<EnvLoader, void>;
  yaml: LoaderOptionSection<YamlLoader, { paths: string[] }>;
  aws: LoaderOptionSection<
    AwsLoader,
    { paths: string[]; region: string; withDecryption: boolean }
  >;
}
