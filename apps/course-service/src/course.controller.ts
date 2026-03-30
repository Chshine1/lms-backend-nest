import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseService } from './services/course.service';
import { CourseContract, CreateCourseDto } from '@app/contracts';
import { ExtractController, CourseTypedClient } from '@app/typed-client';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(private readonly courseService: CourseService) {}

  // ==================== Course Endpoints ====================

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.create',
    queue: 'course-service-course-create',
  })
  createCourse(data: CreateCourseDto): Promise<CourseContract> {
    return this.courseService.create(data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findById',
    queue: 'course-service-course-findById',
  })
  findCourseById(id: number): Promise<CourseContract | null> {
    return this.courseService.findById(id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findAll',
    queue: 'course-service-course-findAll',
  })
  findAllCourses(): Promise<CourseContract[]> {
    return this.courseService.findAll();
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findByTeacher',
    queue: 'course-service-course-findByTeacher',
  })
  findCoursesByTeacher(teacherId: number): Promise<CourseContract[]> {
    return this.courseService.findByTeacher(teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.addTeacher',
    queue: 'course-service-course-addTeacher',
  })
  addTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.courseService.addTeacher(id, teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.removeTeacher',
    queue: 'course-service-course-removeTeacher',
  })
  removeTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.courseService.removeTeacher(id, teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.delete',
    queue: 'course-service-course-delete',
  })
  deleteCourse(id: number): Promise<void> {
    return this.courseService.delete(id);
  }
}
