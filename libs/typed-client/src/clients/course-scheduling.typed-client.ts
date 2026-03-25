import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { CourseScheduleContract } from '@app/contracts/course-scheduling/entities/course-schedule.contract';
import { CreateScheduleDto } from '@app/contracts/course-scheduling/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@app/contracts/course-scheduling/dto/update-schedule.dto';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '@app/typed-client/typed-client.module';
import { CourseSchedulingPatterns } from '@app/typed-client/patterns/course-scheduling.patterns';

@Injectable()
export class CourseSchedulingTypedClient extends TypedClientBase<CourseSchedulingPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, options);
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
