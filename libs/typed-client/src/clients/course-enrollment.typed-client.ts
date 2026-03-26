import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import { EnrollmentContract, CreateEnrollmentDto } from '@app/contracts';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '../typed-client.module';
import { CourseEnrollmentPatterns } from '../patterns/course-enrollment.patterns';
import { TraceService } from '@app/trace';

@Injectable()
export class CourseEnrollmentTypedClient extends TypedClientBase<CourseEnrollmentPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, traceService, options);
  }

  enrollStudent(data: CreateEnrollmentDto): Promise<EnrollmentContract> {
    return this.rpc('course-enrollment.enroll', data);
  }

  getEnrollmentsByCourse(data: {
    courseId: number;
  }): Promise<EnrollmentContract[]> {
    return this.rpc('course-enrollment.getByCourse', data);
  }

  getEnrollmentsByStudent(data: {
    studentId: number;
  }): Promise<EnrollmentContract[]> {
    return this.rpc('course-enrollment.getByStudent', data);
  }

  getEnrollmentById(data: { id: number }): Promise<EnrollmentContract> {
    return this.rpc('course-enrollment.getById', data);
  }

  unenrollStudent(data: { id: number }): Promise<void> {
    return this.rpc('course-enrollment.unenroll', data);
  }

  unenrollByStudentAndCourse(data: {
    studentId: number;
    courseId: number;
  }): Promise<void> {
    return this.rpc('course-enrollment.unenrollByStudentAndCourse', data);
  }
}
