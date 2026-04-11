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

  batchUpdateCourse(
    data: CoursePatterns['course.batch-update']['request'],
  ): Promise<CoursePatterns['course.batch-update']['response']> {
    return this.rpc('course.batch-update', data);
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
}
