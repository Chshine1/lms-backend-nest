import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AssignmentFile } from '../../domain/entities/assignment-file.entity';
import type { IAssignmentFileRepository } from '../../domain/repositories/index';

@Injectable()
export class AssignmentFileRepository implements IAssignmentFileRepository {
  constructor(private readonly em: EntityManager) {}

  async save(file: AssignmentFile): Promise<void> {
    this.em.create(AssignmentFile, file);
    await this.em.flush();
  }

  findByAssignmentId(assignmentId: bigint): Promise<AssignmentFile[]> {
    return this.em.find(AssignmentFile, { assignmentId });
  }

  async deleteByAssignmentId(assignmentId: bigint): Promise<void> {
    const files = await this.em.find(AssignmentFile, { assignmentId });
    for (const file of files) {
      this.em.remove(file);
    }
    await this.em.flush();
  }
}
