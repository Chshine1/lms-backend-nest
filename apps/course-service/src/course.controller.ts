import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseTypedClient, ExtractController } from '@app/typed-client';
import { CourseReadService, CourseWriteService } from './services/index';
import {
  AssignmentContract,
  BatchUpdateCourseDto,
  CourseContract,
  CourseMaterialContract,
  CourseUnitContract,
  CreateCourseDto,
} from '@app/contracts';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(
    private readonly courseReadService: CourseReadService,
    private readonly courseWriteService: CourseWriteService,
  ) {}

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.create',
    queue: 'course-service-course-create',
  })
  createCourse(data: CreateCourseDto): Promise<CourseContract> {
    return this.courseWriteService.createCourse(data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.batch-update',
    queue: 'course-service-course-batch-update',
  })
  batchUpdateCourse(data: {
    courseId: number;
    data: BatchUpdateCourseDto;
  }): Promise<CourseContract> {
    return this.courseWriteService.batchUpdateCourse(data.courseId, data.data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.find-course-with-units',
    queue: 'course-service-course-find-course-with-units',
  })
  async findCourseWithUnits(data: { courseId: number }): Promise<{
    course: CourseContract;
    courseUnits: CourseUnitContract[];
  }> {
    return this.courseReadService.findCourseWithUnits(data.courseId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.find-unit-detail',
    queue: 'course-service-course-find-unit-detail',
  })
  async findUnitDetail(data: {
    courseId: number;
    courseUnitId: number;
  }): Promise<{
    assignments: AssignmentContract[];
    courseMaterials: CourseMaterialContract[];
  }> {
    return this.courseReadService.findUnitDetail(
      data.courseId,
      data.courseUnitId,
    );
  }
}
