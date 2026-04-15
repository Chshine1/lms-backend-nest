import { Inject, Injectable } from '@nestjs/common';
import type { IEnrollmentRepository } from '../../domain/repositories/index';
import { EnrollmentRepository } from '../../infrastructure/repositories/index';
import { EnrollmentDomainService } from '../../domain/services/enrollment.service';
import { StudentEnrolledEvent } from '../../domain/events/domain.events';
import { EventBusService } from '@app/event-bus';

@Injectable()
export class EnrollmentApplicationService {
  constructor(
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly enrollmentDomainService: EnrollmentDomainService,
    private readonly eventBus: EventBusService,
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
    await this.eventBus.publish(event);
  }
}
