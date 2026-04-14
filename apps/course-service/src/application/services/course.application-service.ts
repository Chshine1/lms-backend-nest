import { Injectable } from '@nestjs/common';
import { ICourseRepository } from '../../domain/repositories/index';
import { Course } from '../../domain/entities/course.entity';
import { CourseCreatedEvent } from '../../domain/events/domain.events';

export class CreateCourseDto {
  name!: string;
  code!: string;
  description!: string;
  teacherIds!: bigint[];
}

export class CourseDto {
  id!: bigint;
  name!: string;
  code!: string;
  description!: string;
  teachers!: bigint[];
  createdAt!: Date;
  updatedAt!: Date;
}

@Injectable()
export class CourseApplicationService {
  constructor(private readonly courseRepository: ICourseRepository) {}

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
    console.log('Event:', event);

    return this.mapToDto(course);
  }

  async findById(courseId: bigint): Promise<CourseDto | null> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      return null;
    }
    return this.mapToDto(course);
  }

  private mapToDto(course: Course): CourseDto {
    const dto = new CourseDto();
    dto.id = course.id;
    dto.name = course.name;
    dto.code = course.code;
    dto.description = course.description;
    dto.teachers = course.teachers as bigint[];
    dto.createdAt = course.createdAt;
    dto.updatedAt = course.updatedAt;
    return dto;
  }
}
