import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class AwsConfig {
  @IsDefined()
  @IsString()
  @Expose()
  basePath!: string;

  @IsDefined()
  @IsString()
  @Expose()
  region!: string;

  @IsOptional()
  @IsBoolean()
  @Expose()
  withDecryption?: boolean;
}

export class YamlSchema {
  @IsOptional()
  @IsBoolean()
  @Expose()
  skipAws?: boolean;

  @IsDefined()
  @ValidateNested()
  @Type(() => AwsConfig)
  @Expose()
  aws!: AwsConfig;
}
