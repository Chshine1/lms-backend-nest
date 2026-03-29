import { IsDefined, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class DatabaseConfig {
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
  database!: string;
}
