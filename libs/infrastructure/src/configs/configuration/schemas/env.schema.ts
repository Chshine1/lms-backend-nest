import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export enum Environment {
  development = 'development',
  staging = 'staging',
  production = 'production',
  test = 'test',
}

export class EnvSchema {
  @IsDefined()
  @IsEnum(Environment)
  @Expose()
  environment!: Environment;

  @IsDefined()
  @IsString()
  @Expose()
  serviceName!: string;

  @IsOptional()
  @IsString()
  @Expose()
  configBasePath?: string;
}
