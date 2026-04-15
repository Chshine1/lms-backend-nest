import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ParentStudentLink } from '../../domain/entities/parent-student-link.entity';
import type { IParentStudentLinkRepository } from '../../domain/repositories/index';

@Injectable()
export class ParentStudentLinkRepository implements IParentStudentLinkRepository {
  constructor(private readonly em: EntityManager) {}

  async save(link: ParentStudentLink): Promise<void> {
    this.em.create(ParentStudentLink, link);
    await this.em.flush();
  }

  findLink(
    parentId: bigint,
    studentId: bigint,
  ): Promise<ParentStudentLink | null> {
    return this.em.findOne(ParentStudentLink, {
      parentUserId: parentId,
      studentUserId: studentId,
    });
  }

  findByParentId(parentId: bigint): Promise<ParentStudentLink[]> {
    return this.em.find(ParentStudentLink, { parentUserId: parentId });
  }
}
