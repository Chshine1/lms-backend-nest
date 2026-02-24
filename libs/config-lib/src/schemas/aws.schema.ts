import { IsDefined, IsNumber, IsString } from 'class-validator';

export class AwsSchema {
  @IsDefined()
  @IsString()
  jwtSecret!: string;

  @IsDefined()
  @IsNumber()
  jwtExpiry!: number;
}
