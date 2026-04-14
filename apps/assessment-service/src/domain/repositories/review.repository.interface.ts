import { Review } from '../entities/review.entity';

export interface IReviewRepository {
  save(review: Review): Promise<void>;
  findBySubmissionId(submissionId: bigint): Promise<Review | null>;
}
