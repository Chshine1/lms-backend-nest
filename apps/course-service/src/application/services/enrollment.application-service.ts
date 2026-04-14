import { Injectable } from '@nestjs/common';
import { IEnrollmentRepository } from '../../domain/repositories/index';
import { EnrollmentDomainService } from '../../domain/services/enrollment.service';
import { Enrollment } from '../../domain/entities/enrollment.entity';
import { StudentEnrolledEvent } from '../../domain/events/domain.events';

@Injectable()
export class EnrollmentApplicationService {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly enrollmentDomainService: EnrollmentDomainService,
  ) {}

  async enrollStudent(
    courseId: bigint,
    studentId: bigint,
    enrollerUserId: bigint,
  ): Promise<void> {
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
