import { Expose } from 'class-transformer';
import { IsDefined, IsNumber } from 'class-validator';

export class FileConfig {
  @Expose()
  @IsDefined()
  @IsNumber()
  signedUrlExpiry!: number;
}
