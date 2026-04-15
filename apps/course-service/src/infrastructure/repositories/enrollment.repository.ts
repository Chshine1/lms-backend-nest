import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Enrollment } from '../../domain/entities/enrollment.entity';
import type { IEnrollmentRepository } from '../../domain/repositories/index';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly em: EntityManager) {}

  async save(enrollment: Enrollment): Promise<void> {
    this.em.create(Enrollment, enrollment);
    await this.em.flush();
  }

  findByStudentAndCourse(
    studentId: bigint,
    courseId: bigint,
  ): Promise<Enrollment | null> {
    return this.em.findOne(Enrollment, { studentId, courseId });
  }

  findActiveByStudent(studentId: bigint): Promise<Enrollment[]> {
    return this.em.find(Enrollment, {
      studentId,
      status: EnrollmentStatus.ACTIVE,
    });
  }
}
