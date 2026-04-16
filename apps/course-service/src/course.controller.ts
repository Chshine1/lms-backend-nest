import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseTypedClient, ExtractController } from '@app/typed-client';
import { CreateCourseDto, CourseDto } from '@app/contracts';
import { CourseApplicationService } from './application/services/course.application-service';
import { EnrollmentApplicationService } from './application/services/enrollment.application-service';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(
    private readonly courseApplicationService: CourseApplicationService,
    private readonly enrollmentApplicationService: EnrollmentApplicationService,
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

  async findCourseWithUnits(data: { courseId: bigint }): Promise<{
    course: CourseDto;
    courseUnits: Array<{
      id: bigint;
      courseId: bigint;
      title: string;
      description?: string;
      position: number;
    }>;
  }> {
    const course = await this.courseApplicationService.findById(data.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const courseUnits = await this.courseApplicationService.findUnitsByCourseId(
      data.courseId,
    );
    return { course, courseUnits };
  }

  async findUnitDetail(data: {
    courseId: bigint;
    courseUnitId: bigint;
  }): Promise<{
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
    return this.courseApplicationService.findUnitDetail(
      data.courseId,
      data.courseUnitId,
    );
  }

  async enrollStudent(data: {
    courseId: bigint;
    studentId: bigint;
    enrollerUserId: bigint;
  }): Promise<void> {
    await this.enrollmentApplicationService.enrollStudent(
      data.courseId,
      data.studentId,
      data.enrollerUserId,
    );
  }
}
