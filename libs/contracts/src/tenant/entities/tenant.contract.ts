import { Expose } from 'class-transformer';

export class TenantContract {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose()
  subscriptionPlan!: string;

  @Expose()
  status!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
