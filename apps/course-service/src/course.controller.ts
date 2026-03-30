import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { plainToInstance } from 'class-transformer';
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
import { UserContext } from '@app/authentication';

@Controller()
@UserContext()
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
  async createCourse(data: CreateCourseDto): Promise<CourseContract> {
    const course = await this.courseWriteService.createCourse(data);
    return plainToInstance(CourseContract, course, {
      excludeExtraneousValues: true,
    });
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.batch-update',
    queue: 'course-service-course-batch-update',
  })
  async batchUpdateCourse(data: {
    courseId: number;
    data: BatchUpdateCourseDto;
  }): Promise<CourseContract> {
    const course = await this.courseWriteService.batchUpdateCourse(
      data.courseId,
      data.data,
    );
    return plainToInstance(CourseContract, course, {
      excludeExtraneousValues: true,
    });
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
  async findUnitDetail(data: { unitId: number }): Promise<{
    assignments: AssignmentContract[];
    courseMaterials: CourseMaterialContract[];
  }> {
    return this.courseReadService.findUnitDetail(data.unitId);
  }
}
