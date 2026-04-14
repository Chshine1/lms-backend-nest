import { Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';

export class FileConfig {
  @Expose()
  @IsDefined()
  @IsNumber()
  signedUrlExpiry!: number;

  @Expose()
  @IsDefined()
  @IsString()
  maxFileSize!: string;
}
