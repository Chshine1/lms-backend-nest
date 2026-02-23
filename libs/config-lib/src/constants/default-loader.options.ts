import { LoaderOptions } from '@app/config-lib/interfaces/loader-options.interface';
import { EnvLoader } from '@app/config-lib/loaders/env.loader';
import { YamlLoader } from '@app/config-lib/loaders/yaml.loader';
import {
  Config,
  ConfigObject,
} from '@app/config-lib/interfaces/raw-config.interface';
import { AwsLoader } from '@app/config-lib/loaders/aws.loader';

export const defaultLoaderOptions: LoaderOptions = {
  env: {
    loader: EnvLoader,
    skip: () => false,
    config: () => {},
  },

  yaml: {
    loader: YamlLoader,
    skip: () => false,
    config: (last: Config): ReturnType<LoaderOptions['yaml']['config']> => {
      const basePath = last['configBasePath'] as string | undefined;
      const paths: string[] = [];
      if (basePath !== undefined) {
        paths.push(
          `${basePath}/${last.environment}/global.yaml`,
          `${basePath}/${last.environment}/${last.serviceName}.yaml`,
        );
      }
      return {
        paths,
      };
    },
  },

  aws: {
    loader: AwsLoader,
    skip: (last: Config) => {
      const skipAws = last['skipAws'] as string | undefined;
      return skipAws === 'true'; // Only skip when skipAws is set true explicitly.
    },
    config: (last: Config): ReturnType<LoaderOptions['aws']['config']> => {
      const awsSection = last['aws'] as ConfigObject;

      const basePath = awsSection['basePath'] as string | undefined;
      const region = awsSection['region'] as string | undefined;
      if (basePath === undefined || region === undefined) throw new Error();

      const withDecryption = !(awsSection['withDecryption'] === 'false'); // Only skip decryption when withDecryption is set false explicitly.

      return {
        paths: [
          `/${basePath}/${last.environment}`,
          `/${basePath}/${last.environment}/${last.serviceName}`,
        ],
        region,
        withDecryption,
      };
    },
  },
};
