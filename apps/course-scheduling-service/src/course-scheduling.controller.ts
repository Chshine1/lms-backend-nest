import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseSchedulingService } from './course-scheduling.service';
import { CourseScheduleContract } from '@app/contracts/course-scheduling/entities/course-schedule.contract';
import { CreateScheduleDto } from '@app/contracts/course-scheduling/dto/create-schedule.dto';
import { UpdateScheduleDto } from '@app/contracts/course-scheduling/dto/update-schedule.dto';
import { ExtractController } from '@app/typed-client/types/extract.controller';
import { CourseSchedulingTypedClient } from '@app/typed-client/clients/course-scheduling.typed-client';

@Controller()
export class CourseSchedulingController implements ExtractController<CourseSchedulingTypedClient> {
  constructor(
    private readonly courseSchedulingService: CourseSchedulingService,
  ) {}

  @RabbitRPC({
    exchange: 'course-scheduling-service',
    routingKey: 'course-scheduling.create',
    queue: 'course-scheduling-service-course-scheduling-create',
  })
  createSchedule(dto: CreateScheduleDto): Promise<CourseScheduleContract> {
    return this.courseSchedulingService.createSchedule(dto);
  }

  @RabbitRPC({
    exchange: 'course-scheduling-service',
    routingKey: 'course-scheduling.getByCourse',
    queue: 'course-scheduling-service-course-scheduling-getByCourse',
  })
  getSchedulesByCourse(data: {
    courseId: number;
  }): Promise<CourseScheduleContract[]> {
    return this.courseSchedulingService.getSchedulesByCourse(data.courseId);
  }

  @RabbitRPC({
    exchange: 'course-scheduling-service',
    routingKey: 'course-scheduling.getById',
    queue: 'course-scheduling-service-course-scheduling-getById',
  })
  getScheduleById(data: { id: number }): Promise<CourseScheduleContract> {
    return this.courseSchedulingService.getScheduleById(data.id);
  }

  @RabbitRPC({
    exchange: 'course-scheduling-service',
    routingKey: 'course-scheduling.update',
    queue: 'course-scheduling-service-course-scheduling-update',
  })
  updateSchedule(
    data: { id: number } & UpdateScheduleDto,
  ): Promise<CourseScheduleContract> {
    return this.courseSchedulingService.updateSchedule(data.id, data);
  }

  @RabbitRPC({
    exchange: 'course-scheduling-service',
    routingKey: 'course-scheduling.delete',
    queue: 'course-scheduling-service-course-scheduling-delete',
  })
  deleteSchedule(data: { id: number }): Promise<void> {
    return this.courseSchedulingService.deleteSchedule(data.id);
  }
}
