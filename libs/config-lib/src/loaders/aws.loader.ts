import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';
import { ConfigurationLoader } from '@app/config-lib/interfaces/loader.interface';
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

export class AwsLoader implements ConfigurationLoader {
  async load(
    loadedConfig: unknown,
    dependencies: [ClassConstructor<EnvSchema>, ClassConstructor<YamlSchema>],
    returnSchema: ClassConstructor<AwsSchema>,
  ): Promise<Record<string, unknown>> {
    const env = plainToInstance(dependencies[0], loadedConfig, {
      excludeExtraneousValues: true,
    });
    const yaml = plainToInstance(dependencies[1], loadedConfig, {
      excludeExtraneousValues: true,
    });
    const depsValidationErrors = (
      await Promise.all([validate(env), validate(yaml)])
    ).flat(1);
    if (depsValidationErrors.length > 0) {
      throw new Error(formatValidationErrors(depsValidationErrors));
    }

    const client = new SSMClient({ region: yaml.aws.region });
    const paths: string[] = [
      `/${yaml.aws.basePath}/${env.environment}`,
      `/${yaml.aws.basePath}/${env.environment}/${env.serviceName}`,
    ];

    const loadedPart: Record<string, unknown> = {};
    for (const path of paths) {
      const command = new GetParametersByPathCommand({
        Path: path,
        Recursive: true,
        WithDecryption: yaml.aws.withDecryption || true,
      });

      try {
        const response = await client.send(command);

        // Parameter name to keys, for example '/myapp/tenant-service/port' -> 'tenantService.port'
        // We assume the parameter name to be of the form /prefix/service-name/key

        response.Parameters?.forEach((param) => {
          const paramName = param.Name;
          const paramValue = param.Value;
          const paramType = param.DataType;
          if (paramName === undefined || paramValue === undefined) return;

          const paramNameParts = paramName.replace(path + '/', '').split('/');

          let current = loadedPart;
          paramNameParts.forEach((p, index) => {
            if (index < paramNameParts.length - 1) {
              if (current[p] === undefined) current[p] = {};
              current = current[p] as Record<string, unknown>;
              return;
            }

            let value;

            if (paramType === 'Integer') value = Number(paramValue);
            else if (paramType === 'Boolean') value = Boolean(paramValue);
            else value = paramValue;

            current[p] = value;
          });
        });
      } catch {
        throw new Error('Failed to load config from AWS Parameter Store');
      }
    }

    const result = plainToInstance(returnSchema, loadedPart, {
      excludeExtraneousValues: true,
    });

    const targetValidationErrors = await validate(result);
    if (targetValidationErrors.length > 0) {
      throw new Error(formatValidationErrors(targetValidationErrors));
    }

    return instanceToPlain(result);
  }
}
