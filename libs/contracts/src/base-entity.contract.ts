import { Expose } from 'class-transformer';

export class BaseEntityContract {
  @Expose()
  id!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
