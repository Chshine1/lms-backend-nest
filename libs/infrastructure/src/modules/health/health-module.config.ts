import { IsBoolean, IsDefined, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class HealthModuleConfig {
  @IsDefined()
  @IsBoolean()
  @Expose()
  database!: boolean;

  @IsDefined()
  @IsBoolean()
  @Expose()
  rabbitmq!: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose()
  memory?: boolean;
}
