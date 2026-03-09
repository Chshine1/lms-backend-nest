import { LoaderMiddlewareBase } from '@app/infrastructure/modules/configuration/pipeline/loader.middleware';
import { EnvSchema } from '@app/infrastructure/configs/configuration/schemas/env.schema';
import { YamlSchema } from '@app/infrastructure/configs/configuration/schemas/yaml.schema';
import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';

export class AwsLoader extends LoaderMiddlewareBase<[EnvSchema, YamlSchema]> {
  protected async load(
    dependencies: [EnvSchema, YamlSchema],
  ): Promise<Record<string, unknown>> {
    const env = dependencies[0];
    const yaml = dependencies[1];

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

    return loadedPart;
  }
}
