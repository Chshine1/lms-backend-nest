import { Injectable } from '@nestjs/common';
import { UserTypedClient } from '@app/typed-client';
import type { IEnrollmentRepository } from '../repositories/index';
import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import { AlreadyEnrolledError } from '../errors/index';

@Injectable()
export class EnrollmentDomainService {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly userTypedClient: UserTypedClient,
  ) {}

  async enroll(studentId: bigint, courseId: bigint): Promise<Enrollment> {
    const existing = await this.enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (existing !== null && existing.status === EnrollmentStatus.ACTIVE) {
      throw new AlreadyEnrolledError(studentId, courseId);
    }

    const student = await this.userTypedClient.findUserById({
      userId: studentId,
    });
    if (!student) {
      throw new Error(`Student ${String(studentId)} not found`);
    }

    return new Enrollment(studentId, courseId);
  }
}
