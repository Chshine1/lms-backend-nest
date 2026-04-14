import { Injectable } from '@nestjs/common';
import type { IEnrollmentRepository } from '../../domain/repositories/index';
import { EnrollmentDomainService } from '../../domain/services/enrollment.service';
import { StudentEnrolledEvent } from '../../domain/events/domain.events';

@Injectable()
export class EnrollmentApplicationService {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly enrollmentDomainService: EnrollmentDomainService,
  ) {}

  async enrollStudent(courseId: bigint, studentId: bigint): Promise<void> {
    const enrollment = await this.enrollmentDomainService.enroll(
      studentId,
      courseId,
    );

    await this.enrollmentRepository.save(enrollment);

    const event = new StudentEnrolledEvent(
      enrollment.id,
      enrollment.studentId,
      enrollment.courseId,
    );
    console.log('Event:', event);
  }
}
