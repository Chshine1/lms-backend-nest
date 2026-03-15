import { Expose } from 'class-transformer';

export class ParentContract {
  @Expose()
  userId!: number;

  @Expose()
  relationship!: string;

  @Expose()
  studentIds!: number[];
}
