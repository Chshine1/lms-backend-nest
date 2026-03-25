import { Expose } from 'class-transformer';
import { BaseEntityContract } from '@app/contracts/base-entity.contract';

export class ReviewContract extends BaseEntityContract {
  @Expose()
  submissionId!: number;

  @Expose()
  teacherId!: number;

  @Expose()
  score!: number;

  @Expose()
  feedback!: string;

  @Expose()
  reviewedAt!: Date;
}
