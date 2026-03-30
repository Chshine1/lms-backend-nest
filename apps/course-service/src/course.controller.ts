import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseReadService, CourseWriteService } from './services/index';
import { CourseContract, CreateCourseDto } from '@app/contracts';
import { ExtractController, CourseTypedClient } from '@app/typed-client';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(
    private readonly courseReadService: CourseReadService,
    private readonly courseWriteService: CourseWriteService,
  ) {}

  // ==================== Course Endpoints ====================

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.create',
    queue: 'course-service-course-create',
  })
  createCourse(data: CreateCourseDto): Promise<CourseContract> {
    return this.courseReadService.create(data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findById',
    queue: 'course-service-course-findById',
  })
  findCourseById(id: number): Promise<CourseContract | null> {
    return this.courseReadService.findById(id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findAll',
    queue: 'course-service-course-findAll',
  })
  findAllCourses(): Promise<CourseContract[]> {
    return this.courseReadService.findAll();
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findByTeacher',
    queue: 'course-service-course-findByTeacher',
  })
  findCoursesByTeacher(teacherId: number): Promise<CourseContract[]> {
    return this.courseReadService.findByTeacher(teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.addTeacher',
    queue: 'course-service-course-addTeacher',
  })
  addTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.courseReadService.addTeacher(id, teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.removeTeacher',
    queue: 'course-service-course-removeTeacher',
  })
  removeTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.courseReadService.removeTeacher(id, teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.delete',
    queue: 'course-service-course-delete',
  })
  deleteCourse(id: number): Promise<void> {
    return this.courseReadService.delete(id);
  }
}
