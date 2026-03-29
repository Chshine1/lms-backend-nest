import { Expose } from 'class-transformer';
import { BaseEntityContract } from '../../base-entity';

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
