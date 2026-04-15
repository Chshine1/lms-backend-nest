import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import type { IStudentProfileRepository } from '../../domain/repositories/index';

@Injectable()
export class StudentProfileRepository implements IStudentProfileRepository {
  constructor(private readonly em: EntityManager) {}

  async save(profile: StudentProfile): Promise<void> {
    this.em.create(StudentProfile, profile);
    await this.em.flush();
  }

  findByUserId(userId: bigint): Promise<StudentProfile | null> {
    return this.em.findOne(StudentProfile, { userId });
  }
}
