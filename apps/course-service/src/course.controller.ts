import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseService } from './course.service';
import { CourseContract } from '@app/contracts/course/entities/course.contract';
import { ExtractController } from '@app/typed-client/types/extract.controller';
import { CourseTypedClient } from '@app/typed-client/clients/course.typed-client';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(private readonly courseService: CourseService) {}

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findById',
    queue: 'course-service-course-findById',
  })
  findCourseById(id: number): Promise<CourseContract | null> {
    return this.courseService.findById(id);
  }
}
