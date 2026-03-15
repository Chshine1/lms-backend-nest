import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export class UserContract extends BaseEntityContract {
  @Expose()
  username!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string;

  @Expose()
  role!: string;
}
