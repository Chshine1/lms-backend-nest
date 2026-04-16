import { Inject, Injectable } from '@nestjs/common';
import type { ICourseRepository } from '../../domain/repositories/index';
import { CourseRepository } from '../../infrastructure/repositories/index';
import { Course } from '../../domain/entities/course.entity';
import { CourseCreatedEvent } from '../../domain/events/domain.events';
import { CreateCourseDto, CourseDto } from '@app/contracts';
import { EventBusService } from '@app/event-bus';

@Injectable()
export class CourseApplicationService {
  constructor(
    @Inject(CourseRepository)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async createCourse(
    dto: CreateCourseDto,
    _creatorUserId: bigint,
  ): Promise<CourseDto> {
    const existing = await this.courseRepository.findByCode(dto.code);
    if (existing) {
      throw new Error(`Course with code ${dto.code} already exists`);
    }

    const course = new Course();
    course.name = dto.name;
    course.code = dto.code;
    course.description = dto.description;
    course.teachers = dto.teacherIds;

    await this.courseRepository.save(course);

    const event = new CourseCreatedEvent(
      course.id,
      course.name,
      course.code,
      course.teachers,
    );
    await this.eventBus.publish(event);

    return this.mapToDto(course);
  }

  async findById(courseId: bigint): Promise<CourseDto | null> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      return null;
    }
    return this.mapToDto(course);
  }

  async findUnitsByCourseId(courseId: bigint): Promise<
    Array<{
      id: bigint;
      courseId: bigint;
      title: string;
      description?: string;
      position: number;
    }>
  > {
    const units = await this.courseRepository.findUnitsByCourseId(courseId);
    return units.map((unit) => ({
      id: unit.id,
      courseId: unit.courseId,
      title: unit.title,
      ...(unit.description !== undefined && { description: unit.description }),
      position: unit.position,
    }));
  }

  async findUnitDetail(
    courseId: bigint,
    courseUnitId: bigint,
  ): Promise<{
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
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const unit = await this.courseRepository.findUnitById(courseUnitId);
    if (!unit || unit.courseId !== courseId) {
      throw new Error('Unit not found');
    }

    return {
      assignments: [],
      courseMaterials: [],
    };
  }

  private mapToDto(course: Course): CourseDto {
    const dto = new CourseDto();
    dto.id = course.id;
    dto.courseName = course.name;
    dto.code = course.code;
    dto.description = course.description;
    dto.teachers = course.teachers;
    dto.createdAt = course.createdAt;
    dto.updatedAt = course.updatedAt;
    return dto;
  }
}
