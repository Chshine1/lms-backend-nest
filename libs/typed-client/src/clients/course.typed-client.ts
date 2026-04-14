import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { CoursePatterns } from '../patterns/course.patterns';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';

@Injectable()
export class CourseTypedClient extends TypedClientBase<CoursePatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super('course-service', amqpConnection, userContextService, options);
  }

  createCourse(
    data: CoursePatterns['course.create']['request'],
  ): Promise<CoursePatterns['course.create']['response']> {
    return this.rpc('course.create', data);
  }

  findCourseById(
    data: CoursePatterns['course.find-by-id']['request'],
  ): Promise<CoursePatterns['course.find-by-id']['response']> {
    return this.rpc('course.find-by-id', data);
  }

  findCourseWithUnits(
    data: CoursePatterns['course.find-course-with-units']['request'],
  ): Promise<CoursePatterns['course.find-course-with-units']['response']> {
    return this.rpc('course.find-course-with-units', data);
  }

  findUnitDetail(
    data: CoursePatterns['course.find-unit-detail']['request'],
  ): Promise<CoursePatterns['course.find-unit-detail']['response']> {
    return this.rpc('course.find-unit-detail', data);
  }

  enrollStudent(
    data: CoursePatterns['course.enroll-student']['request'],
  ): Promise<CoursePatterns['course.enroll-student']['response']> {
    return this.rpc('course.enroll-student', data);
  }
}
