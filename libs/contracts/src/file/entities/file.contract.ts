import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

export class FileContract extends BaseEntityContract {
  @Expose()
  storageKey!: string;

  @Expose()
  contentType!: string;

  @Expose()
  size!: number;

  @Expose()
  checksum!: string;

  @Expose()
  createdBy!: number;
}
