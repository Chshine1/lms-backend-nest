import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '@/course-service/src/entities/course.entity';
import { Repository } from 'typeorm';
import { UserTypedClient } from '@app/typed-client';
import { Transactional } from 'nestjs-transaction';
import {
  BatchUpdateCourseDto,
  CourseContract,
  CreateCourseDto,
  IdentityType,
} from '@app/contracts';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserContextService } from '@app/authentication';

@Injectable()
export class CourseWriteService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private userContextService: UserContextService,
    private userClient: UserTypedClient,
  ) {}

  @Transactional()
  async createCourse(dto: CreateCourseDto): Promise<CourseContract> {
    const userId = this.userContextService.getUserId();
    if (dto.teachers !== undefined && dto.teachers.length > 0) {
      const users = await this.userClient.getUsers(dto.teachers);
      const invalid = users.some(
        (u) => u === undefined || u.identityType !== IdentityType.TEACHER,
      );
      if (invalid) {
        throw new BadRequestException('Invalid teachers');
      }
    }

    const course = this.courseRepository.create({
      ...instanceToPlain(dto),
      createdBy: userId,
    });
    await this.courseRepository.save(course);

    // TODO: 发布 CourseCreatedEvent
    return plainToInstance(CourseContract, course, {
      excludeExtraneousValues: true,
    });
  }

  @Transactional()
  async batchUpdateCourse(
    courseId: number,
    dto: BatchUpdateCourseDto,
  ): Promise<CourseContract> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseUnits', 'courseUnits.assignments'],
    });
    if (course === null) throw new NotFoundException('Course not found');

    if (dto.name !== undefined) course.name = dto.name;
    if (dto.description !== undefined) course.description = dto.description;

    if (dto.units !== undefined) course.updateUnits(dto.units);

    const result = await this.courseRepository.save(course);
    return plainToInstance(CourseContract, result, {
      excludeExtraneousValues: true,
    });
  }
}
