import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';
import { ConfigLoader } from '@app/config-lib/interfaces/loader.interface';
import { ConfigObject } from '@app/config-lib/interfaces/raw-config.interface';
import { merge } from 'lodash';

export class AwsLoader implements ConfigLoader<{
  paths: string[];
  region: string;
  withDecryption: boolean;
}> {
  async load(options: {
    paths: string[];
    region: string;
    withDecryption: boolean;
  }): Promise<ConfigObject> {
    const client = new SSMClient({ region: options.region });
    const configs: ConfigObject[] = [];
    for (const path of options.paths) {
      const command = new GetParametersByPathCommand({
        Path: path,
        Recursive: true,
        WithDecryption: options.withDecryption,
      });

      try {
        const response = await client.send(command);
        const config: ConfigObject = {};

        // Parameter name to keys, for example '/myapp/tenant-service/port' -> 'tenantService.port'
        // We assume the parameter name to be of the form /prefix/service-name/key

        response.Parameters?.forEach((param) => {
          const paramName = param.Name;
          const paramValue = param.Value;
          const type = param.DataType;
          if (paramName === undefined || paramValue === undefined) return;

          const parts = paramName.replace(path + '/', '').split('/');

          let current = config;
          for (const part of parts) {
            if (current[part] === undefined) current[part] = {};
            current = current[part] as ConfigObject;
          }
          const lastKey = parts[parts.length - 1];
          if (lastKey === undefined) throw new Error('Unexpected out of range');

          let value;
          if (type === 'Integer') value = Number(paramValue);
          else if (type === 'Boolean') value = Boolean(paramValue);
          else value = paramValue;

          current[lastKey] = value;
        });

        configs.push(config);
      } catch (error) {
        console.error('Failed to load config from AWS Parameter Store', error);
        configs.push({});
      }
    }
    return merge({}, ...configs) as ConfigObject;
  }
}
