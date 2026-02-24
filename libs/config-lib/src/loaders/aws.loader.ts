import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';
import { ConfigLoader } from '@app/config-lib/interfaces/loader.interface';
import { ConfigObject } from '@app/config-lib/interfaces/raw-config.interface';
import { merge } from 'lodash';
import { EnvSchema } from '@app/config-lib/schemas/env.schema';
import { YamlSchema } from '@app/config-lib/schemas/yaml.schema';
import { AwsSchema } from '@app/config-lib/schemas/aws.schema';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { validate } from 'class-validator';
import { formatValidationErrors } from '@app/config-lib/utils/format-validation-errors.utils';

export class AwsLoader implements ConfigLoader {
  async load(
    last: unknown,
    depSchemas: [ClassConstructor<EnvSchema>, ClassConstructor<YamlSchema>],
    returnSchema: ClassConstructor<AwsSchema>,
  ): Promise<ConfigObject> {
    const env = plainToInstance(depSchemas[0], last, {
      excludeExtraneousValues: true,
    });
    const yaml = plainToInstance(depSchemas[1], last, {
      excludeExtraneousValues: true,
    });
    const errors = (await Promise.all([validate(env), validate(yaml)])).flat(1);
    if (errors.length > 0) {
      throw new Error(formatValidationErrors(errors));
    }

    const client = new SSMClient({ region: yaml.aws.region });
    const paths: string[] = [
      `/${yaml.aws.basePath}/${env.environment}`,
      `/${yaml.aws.basePath}/${env.environment}/${env.serviceName}`,
    ];
    const configs: ConfigObject[] = [];
    for (const path of paths) {
      const command = new GetParametersByPathCommand({
        Path: path,
        Recursive: true,
        WithDecryption: yaml.aws.withDecryption || true,
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
    const result = plainToInstance(returnSchema, merge({}, ...configs));

    const errs = await validate(result);
    if (errs.length > 0) {
      throw new Error(formatValidationErrors(errs));
    }

    return instanceToPlain(result);
  }
}
