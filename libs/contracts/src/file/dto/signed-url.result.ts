import { Expose } from 'class-transformer';

export class SignedUrlResult {
  @Expose()
  url!: string;

  @Expose()
  expiresAt!: Date;
}
