import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { StudentProfile } from '../../domain/entities/student-profile.entity';
import { User } from '../../domain/entities/user.entity';
import type { IStudentProfileRepository } from '../../domain/repositories/index';

@Injectable()
export class StudentProfileRepository implements IStudentProfileRepository {
  constructor(private readonly em: EntityManager) {}

  async save(profile: StudentProfile): Promise<void> {
    this.em.create(StudentProfile, profile);
    await this.em.flush();
  }

  async findByUserId(
    userId: bigint,
    options?: { include?: string[] },
  ): Promise<StudentProfile | null> {
    const profile = await this.em.findOne(StudentProfile, { userId });
    if (!profile || !options?.include) {
      return profile;
    }

    // Lazy-load relationships based on include option
    if (options.include.includes('user')) {
      const user = await this.em.findOne(User, { id: userId });
      Object.assign(profile, { user });
    }

    return profile;
  }
}
