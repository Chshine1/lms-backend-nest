import { IsDefined, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class JwtConfig {
  @Expose()
  @IsDefined()
  @IsString()
  secret!: string;

  @Expose()
  @IsDefined()
  @IsNumber()
  expiry!: number;
}
