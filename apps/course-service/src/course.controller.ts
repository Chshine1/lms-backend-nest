import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
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
    queueOptions: {
      durable: true,
      autoDelete: false,
    },
  })
  async findCourseById(data: { courseId: bigint }): Promise<CourseDto | null> {
    return this.courseApplicationService.findById(data.courseId);
  }

  findCourseWithUnits(_data: { courseId: bigint }): Promise<{
    course: CourseDto;
    courseUnits: Array<{
      id: bigint;
      courseId: bigint;
      title: string;
      description?: string;
      position: number;
    }>;
  }> {
    throw new Error('Method not implemented.');
  }
  findUnitDetail(_data: { courseId: bigint; courseUnitId: bigint }): Promise<{
    assignments: Array<{
      id: bigint;
      courseUnitId: bigint;
      title: string;
      description: string;
      dueDate: Date;
      attachments: bigint[];
    }>;
    courseMaterials: Array<{
      id: bigint;
      courseUnitId: bigint;
      fileId: bigint;
      title: string;
    }>;
  }> {
    throw new Error('Method not implemented.');
  }
  enrollStudent(_data: {
    courseId: bigint;
    studentId: bigint;
    enrollerUserId: bigint;
  }): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
