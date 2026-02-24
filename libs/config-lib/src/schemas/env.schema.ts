import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
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
