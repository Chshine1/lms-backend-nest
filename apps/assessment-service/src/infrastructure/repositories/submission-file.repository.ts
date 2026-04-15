import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { SubmissionFile } from '../../domain/entities/submission-file.entity';
import type { ISubmissionFileRepository } from '../../domain/repositories/index';

@Injectable()
export class SubmissionFileRepository implements ISubmissionFileRepository {
  constructor(private readonly em: EntityManager) {}

  async save(file: SubmissionFile): Promise<void> {
    this.em.create(SubmissionFile, file);
    await this.em.flush();
  }

  findBySubmissionId(submissionId: bigint): Promise<SubmissionFile[]> {
    return this.em.find(SubmissionFile, { submissionId });
  }

  async deleteBySubmissionId(submissionId: bigint): Promise<void> {
    const files = await this.em.find(SubmissionFile, { submissionId });
    for (const file of files) {
      this.em.remove(file);
    }
    await this.em.flush();
  }
}
