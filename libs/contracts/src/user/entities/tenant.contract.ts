import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

export class TenantContract extends BaseEntityContract {
  @Expose()
  name!: string;

  @Expose()
  code!: string;

  @Expose()
  status!: 'active' | 'suspended';
}
