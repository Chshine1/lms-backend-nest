import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export class TenantContract extends BaseEntityContract {
  @Expose()
  name!: string;

  @Expose()
  code!: string;

  @Expose()
  status!: 'active' | 'suspended';
}
