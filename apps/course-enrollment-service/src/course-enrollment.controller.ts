import { Controller } from '@nestjs/common';
import { defaultNackErrorHandler, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseEnrollmentService } from './course-enrollment.service';
import { EnrollmentContract, CreateEnrollmentDto } from '@app/contracts';
import {
  CourseEnrollmentTypedClient,
  ExtractController,
} from '@app/typed-client';

@Controller()
export class CourseEnrollmentController implements ExtractController<CourseEnrollmentTypedClient> {
  constructor(
    private readonly courseEnrollmentService: CourseEnrollmentService,
  ) {}

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.enroll',
    queue: 'course-enrollment-service-course-enrollment-enroll',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  enrollStudent(dto: CreateEnrollmentDto): Promise<EnrollmentContract> {
    return this.courseEnrollmentService.enrollStudent(dto);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.getByCourse',
    queue: 'course-enrollment-service-course-enrollment-getByCourse',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
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
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
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
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  getEnrollmentById(data: { id: number }): Promise<EnrollmentContract> {
    return this.courseEnrollmentService.getEnrollmentById(data.id);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.unenroll',
    queue: 'course-enrollment-service-course-enrollment-unenroll',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  unenrollStudent(data: { id: number }): Promise<void> {
    return this.courseEnrollmentService.unenrollStudent(data.id);
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.unenrollByStudentAndCourse',
    queue:
      'course-enrollment-service-course-enrollment-unenrollByStudentAndCourse',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
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

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.getEnrollmentsByStudentWithCourse',
    queue:
      'course-enrollment-service-course-enrollment-getEnrollmentsByStudentWithCourse',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  getEnrollmentsByStudentWithCourse(data: {
    studentId: number;
  }): Promise<EnrollmentContract[]> {
    return this.courseEnrollmentService.getEnrollmentsByStudentWithCourse(
      data.studentId,
    );
  }

  @RabbitRPC({
    exchange: 'course-enrollment-service',
    routingKey: 'course-enrollment.getByStudentAndCourse',
    queue: 'course-enrollment-service-course-enrollment-getByStudentAndCourse',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  getEnrollmentByStudentAndCourse(data: {
    studentId: number;
    courseId: number;
  }): Promise<EnrollmentContract | null> {
    return this.courseEnrollmentService.getEnrollmentByStudentAndCourse(
      data.studentId,
      data.courseId,
    );
  }
}
