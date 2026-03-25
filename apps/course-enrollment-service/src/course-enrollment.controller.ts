import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseEnrollmentService } from './course-enrollment.service';
import { EnrollmentContract } from '@app/contracts/course-enrollment/entities/enrollment.contract';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { ExtractController } from '@app/typed-client/types/extract.controller';
import { CourseEnrollmentTypedClient } from '@app/typed-client/clients/course-enrollment.typed-client';

@Controller()
export class CourseEnrollmentController implements ExtractController<CourseEnrollmentTypedClient> {
  constructor(
    private readonly courseEnrollmentService: CourseEnrollmentService,
  ) {}

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.enroll',
    queue: 'course-enrollment-service-course-enrollment-enroll',
  })
  enrollStudent(dto: CreateEnrollmentDto): Promise<EnrollmentContract> {
    return this.courseEnrollmentService.enrollStudent(dto);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.getByCourse',
    queue: 'course-enrollment-service-course-enrollment-getByCourse',
  })
  getEnrollmentsByCourse(data: {
    courseId: number;
  }): Promise<EnrollmentContract[]> {
    return this.courseEnrollmentService.getEnrollmentsByCourse(data.courseId);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.getByStudent',
    queue: 'course-enrollment-service-course-enrollment-getByStudent',
  })
  getEnrollmentsByStudent(data: {
    studentId: number;
  }): Promise<EnrollmentContract[]> {
    return this.courseEnrollmentService.getEnrollmentsByStudent(data.studentId);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.getById',
    queue: 'course-enrollment-service-course-enrollment-getById',
  })
  getEnrollmentById(data: { id: number }): Promise<EnrollmentContract> {
    return this.courseEnrollmentService.getEnrollmentById(data.id);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.unenroll',
    queue: 'course-enrollment-service-course-enrollment-unenroll',
  })
  unenrollStudent(data: { id: number }): Promise<void> {
    return this.courseEnrollmentService.unenrollStudent(data.id);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.unenrollByStudentAndCourse',
    queue:
      'course-enrollment-service-course-enrollment-unenrollByStudentAndCourse',
  })
  unenrollByStudentAndCourse(data: {
    studentId: number;
    courseId: number;
  }): Promise<void> {
    return this.courseEnrollmentService.unenrollByStudentAndCourse(
      data.studentId,
      data.courseId,
    );
  }
}
