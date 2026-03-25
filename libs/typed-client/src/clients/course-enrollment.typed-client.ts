import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { EnrollmentContract } from '@app/contracts/course-enrollment/entities/enrollment.contract';
import { CreateEnrollmentDto } from '@/course-enrollment-service/src/dto/create-enrollment.dto';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '@app/typed-client/typed-client.module';
import { CourseEnrollmentPatterns } from '@app/typed-client/patterns/course-enrollment.patterns';

@Injectable()
export class CourseEnrollmentTypedClient extends TypedClientBase<CourseEnrollmentPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, options);
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
