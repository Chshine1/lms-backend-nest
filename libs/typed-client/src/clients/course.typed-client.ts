import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { CourseContract } from '@app/contracts/course/entities/course.contract';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '@app/typed-client/typed-client.module';
import { CoursePatterns } from '@app/typed-client/patterns/course.patterns';

@Injectable()
export class CourseTypedClient extends TypedClientBase<CoursePatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, options);
  }

  findCourseById(id: number): Promise<CourseContract | null> {
    return this.rpc('course.findById', { id });
  }
}
