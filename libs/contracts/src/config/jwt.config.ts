import { IsDefined, IsNumber, IsString } from 'class-validator';

export class JwtConfig {
  @IsDefined()
  @IsString()
  secret!: string;

  @IsDefined()
  @IsNumber()
  expiry!: number;
}
