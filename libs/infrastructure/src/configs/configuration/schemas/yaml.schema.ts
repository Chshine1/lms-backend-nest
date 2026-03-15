import {
  IsBoolean,
  IsDefined,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AwsConfig {
  @IsDefined()
  @IsString()
  basePath!: string;

  @IsDefined()
  @IsString()
  region!: string;

  @IsOptional()
  @IsBoolean()
  withDecryption?: boolean;
}

export class YamlSchema {
  @IsOptional()
  @IsBoolean()
  skipAws?: boolean;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => AwsConfig)
  aws!: AwsConfig;
}
