import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Submission } from '../../domain/entities/submission.entity';
import type { ISubmissionRepository } from '../../domain/repositories/index';

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
  constructor(private readonly em: EntityManager) {}

  async save(submission: Submission): Promise<void> {
    this.em.create(Submission, submission);
    await this.em.flush();
  }

  findById(id: bigint): Promise<Submission | null> {
    return this.em.findOne(Submission, { id });
  }

  findByStudentAndAssignment(
    studentId: bigint,
    assignmentId: bigint,
  ): Promise<Submission | null> {
    return this.em.findOne(Submission, { studentId, assignmentId });
  }
}
