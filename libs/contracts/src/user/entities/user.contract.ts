import { Expose } from 'class-transformer';

export class UserContract {
  @Expose()
  id!: number;

  @Expose()
  username!: string;

  @Expose()
  email!: string;

  @Expose()
  tenantId!: number;

  @Expose()
  roles!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
