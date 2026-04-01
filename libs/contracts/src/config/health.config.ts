import { IsDefined, IsNumber, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class HealthConfig {
  @IsDefined()
  @IsNumber()
  @Expose()
  port!: number;

  @IsOptional()
  @IsNumber()
  @Expose()
  timeoutMs?: number;
}
