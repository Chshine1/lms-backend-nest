import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BootstrapPhaseConfig {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  timeout?: number;

  @IsOptional()
  @IsBoolean()
  enableLogging?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retryAttempts?: number;
}

export class BootstrapEventBusConfig {
  @IsBoolean()
  enabled: boolean = true;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  bufferSize?: number;
}

export class BootstrapConfig {
  @IsOptional()
  @ValidateNested()
  @Type(() => BootstrapPhaseConfig)
  preBootstrap?: BootstrapPhaseConfig;

  @ValidateNested()
  @Type(() => BootstrapPhaseConfig)
  bootstrap: BootstrapPhaseConfig = {
    timeout: 30000,
    enableLogging: true,
    retryAttempts: 3,
  };

  @IsOptional()
  @ValidateNested()
  @Type(() => BootstrapPhaseConfig)
  postBootstrap?: BootstrapPhaseConfig;

  @ValidateNested()
  @Type(() => BootstrapEventBusConfig)
  eventBus: BootstrapEventBusConfig = {
    enabled: true,
    bufferSize: 100,
  };
}

export interface BootstrapOptions {
  timeout?: number;
  enableLogging?: boolean;
  retryAttempts?: number;
}
