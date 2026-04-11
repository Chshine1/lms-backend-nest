import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import {
  CourseScheduleContract,
  CreateScheduleDto,
  UpdateScheduleDto,
} from '@app/contracts';
import { CourseSchedulingPatterns } from '../patterns/course-scheduling.patterns';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';

@Injectable()
export class CourseSchedulingTypedClient extends TypedClientBase<CourseSchedulingPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super(
      'course-scheduling-service',
      amqpConnection,
      userContextService,
      options,
    );
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
