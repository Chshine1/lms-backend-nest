import { Expose } from 'class-transformer';

export class FileReference {
  @Expose()
  fileId!: string;

  @Expose()
  fileName!: string;
}
