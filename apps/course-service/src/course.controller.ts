import { Controller } from '@nestjs/common';
import { defaultNackErrorHandler, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseTypedClient, ExtractController } from '@app/typed-client';
import { CreateCourseDto, CourseDto } from '@app/contracts';
import { CourseApplicationService } from './application/services/course.application-service';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(
    private readonly courseApplicationService: CourseApplicationService,
  ) {}

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.create',
    queue: 'course-service-course-create',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  async createCourse(data: {
    dto: CreateCourseDto;
    creatorUserId: bigint;
  }): Promise<CourseDto> {
    return this.courseApplicationService.createCourse(
      data.dto,
      data.creatorUserId,
    );
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.find-by-id',
    queue: 'course-service-course-find-by-id',
    errorHandler: defaultNackErrorHandler,
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  async findCourseById(data: { courseId: bigint }): Promise<CourseDto | null> {
    return this.courseApplicationService.findById(data.courseId);
  }
}
