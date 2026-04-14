import { IsDefined, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class RabbitMQConfig {
  @IsString()
  @IsDefined()
  @Expose()
  host!: string;

  @IsNumber()
  @IsDefined()
  @Expose()
  port!: number;

  @IsString()
  @IsDefined()
  @Expose()
  username!: string;

  @IsString()
  @IsDefined()
  @Expose()
  password!: string;

  @IsString()
  @IsDefined()
  @Expose()
  eventExchange!: string;

  @IsString()
  @IsDefined()
  @Expose()
  eventQueue!: string;
}
