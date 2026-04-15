import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Review } from '../../domain/entities/review.entity';
import type { IReviewRepository } from '../../domain/repositories/index';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly em: EntityManager) {}

  async save(review: Review): Promise<void> {
    this.em.create(Review, review);
    await this.em.flush();
  }

  findBySubmissionId(submissionId: bigint): Promise<Review | null> {
    return this.em.findOne(Review, { submissionId });
  }
}
