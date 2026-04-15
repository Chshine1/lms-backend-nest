import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Assignment } from '../../domain/entities/assignment.entity';
import type { IAssignmentRepository } from '../../domain/repositories/index';

@Injectable()
export class AssignmentRepository implements IAssignmentRepository {
  constructor(private readonly em: EntityManager) {}

  async save(assignment: Assignment): Promise<void> {
    this.em.create(Assignment, assignment);
    await this.em.flush();
  }

  findById(id: bigint): Promise<Assignment | null> {
    return this.em.findOne(Assignment, { id });
  }

  findByUnitId(unitId: bigint): Promise<Assignment[]> {
    return this.em.find(Assignment, { unitId });
  }
}
