import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Course } from '../../domain/entities/course.entity';
import type { ICourseRepository } from '../../domain/repositories/index';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly em: EntityManager) {}

  async save(course: Course): Promise<void> {
    this.em.create(Course, course);
    await this.em.flush();
  }

  findById(id: bigint): Promise<Course | null> {
    return this.em.findOne(Course, { id });
  }

  findByCode(code: string): Promise<Course | null> {
    return this.em.findOne(Course, { code });
  }
}
