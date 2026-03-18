import { Expose } from 'class-transformer';

export class AdminContract {
  @Expose()
  userId!: number;

  @Expose()
  department!: string;

  @Expose()
  jobTitle?: string;
}
