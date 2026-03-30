import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '@/course-service/src/entities/course.entity';
import { Repository } from 'typeorm';
import { CourseUnit } from '@/course-service/src/entities/course-unit.entity';
import {
  AssignmentContract,
  CourseContract,
  CourseMaterialContract,
  CourseUnitContract,
} from '@app/contracts';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CourseReadService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseUnit)
    private unitRepository: Repository<CourseUnit>,
  ) {}

  async findCourseWithUnits(courseId: number): Promise<{
    course: CourseContract;
    courseUnits: CourseUnitContract[];
  }> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseUnits'],
    });
    if (course === null) throw new NotFoundException('Course not found');
    return {
      course: plainToInstance(CourseContract, course, {
        excludeExtraneousValues: true,
      }),
      courseUnits: plainToInstance(CourseUnitContract, course.courseUnits, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findUnitDetail(unitId: number): Promise<{
    courseUnit: CourseUnitContract;
    assignments: AssignmentContract[];
    courseMaterials: CourseMaterialContract[];
  }> {
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: ['assignments', 'courseMaterials'],
    });
    if (unit === null) throw new NotFoundException('Unit not found');
    return {
      courseUnit: plainToInstance(CourseUnitContract, unit, {
        excludeExtraneousValues: true,
      }),
      assignments: plainToInstance(AssignmentContract, unit.assignments, {
        excludeExtraneousValues: true,
      }),
      courseMaterials: plainToInstance(
        CourseMaterialContract,
        unit.courseMaterials,
        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }
}
