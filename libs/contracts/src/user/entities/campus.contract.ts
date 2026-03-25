import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity.contract';

export class CampusContract extends BaseEntityContract {
  @Expose()
  tenantId!: number;

  @Expose()
  name!: string;

  @Expose()
  location!: string;

  @Expose()
  timezone?: string;
}
