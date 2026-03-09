import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Environment {
  development = 'development',
  staging = 'staging',
  production = 'production',
  test = 'test',
}

export class EnvSchema {
  @IsDefined()
  @IsEnum(Environment)
  environment!: Environment;

  @IsDefined()
  @IsString()
  serviceName!: string;

  @IsOptional()
  @IsString()
  configBasePath?: string;
}
