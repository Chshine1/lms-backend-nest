import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class StorageConfig {
  @Expose()
  @IsDefined()
  @IsString()
  storagePath!: string;
}
