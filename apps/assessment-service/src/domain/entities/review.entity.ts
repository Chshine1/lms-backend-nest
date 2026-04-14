import { defineEntity, p } from '@mikro-orm/core';
import { AggregateRootSchema } from '@app/contracts';

const ReviewSchema = defineEntity({
  name: 'Review',
  extends: AggregateRootSchema,
  tableName: 'reviews',
  properties: {
    submissionId: p.bigint().unique(),
    assignmentId: p.bigint(),
    studentId: p.bigint(),
    reviewerId: p.bigint(),
    grade: p.integer(),
    comment: p.text().default(''),
    reviewedAt: p.datetime(),
  },
});

export class Review extends ReviewSchema.class {
  declare comment: string;

  constructor() {
    super();
    this.comment = '';
  }

  updateGrade(newGrade: number, totalGrade: number): void {
    if (newGrade < 0 || newGrade > totalGrade) {
      throw new Error(`Grade must be between 0 and ${String(totalGrade)}`);
    }
    this.grade = newGrade;
    this.reviewedAt = new Date();
  }
}

ReviewSchema.setClass(Review);
