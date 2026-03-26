import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import {
  CourseScheduleContract,
  CreateScheduleDto,
  UpdateScheduleDto,
} from '@app/contracts';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '../typed-client.module';
import { CourseSchedulingPatterns } from '../patterns/course-scheduling.patterns';
import { TraceService } from '@app/trace';

@Injectable()
export class CourseSchedulingTypedClient extends TypedClientBase<CourseSchedulingPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, traceService, options);
  }

  createSchedule(data: CreateScheduleDto): Promise<CourseScheduleContract> {
    return this.rpc('course-scheduling.create', data);
  }

  getSchedulesByCourse(data: {
    courseId: number;
  }): Promise<CourseScheduleContract[]> {
    return this.rpc('course-scheduling.getByCourse', data);
  }

  getScheduleById(data: { id: number }): Promise<CourseScheduleContract> {
    return this.rpc('course-scheduling.getById', data);
  }

  updateSchedule(
    data: { id: number } & UpdateScheduleDto,
  ): Promise<CourseScheduleContract> {
    return this.rpc('course-scheduling.update', data);
  }

  deleteSchedule(data: { id: number }): Promise<void> {
    return this.rpc('course-scheduling.delete', data);
  }
}
