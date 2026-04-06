import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Assignment,
  Course,
  CourseMaterial,
  CourseUnit,
} from '../entities/index';
import { Repository } from 'typeorm';
import {
  AssignmentContract,
  CourseContract,
  CourseMaterialContract,
  CourseUnitContract,
} from '@app/contracts';
import { plainToInstance } from 'class-transformer';
import { CourseNotFoundError, CourseUnitNotFoundError } from '../errors/index';

@Injectable()
export class CourseReadService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseUnit)
    private unitRepository: Repository<CourseUnit>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(CourseMaterial)
    private courseMaterialRepository: Repository<CourseMaterial>,
  ) {}

  async findCourseWithUnits(courseId: number): Promise<{
    course: CourseContract;
    courseUnits: CourseUnitContract[];
  }> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseUnits'],
    });
    if (course === null) throw new CourseNotFoundError(courseId);
    return {
      course: plainToInstance(CourseContract, course, {
        excludeExtraneousValues: true,
      }),
      courseUnits: plainToInstance(CourseUnitContract, course.courseUnits, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findUnitDetail(
    courseId: number,
    courseUnitId: number,
  ): Promise<{
    assignments: AssignmentContract[];
    courseMaterials: CourseMaterialContract[];
  }> {
    const exists = await this.unitRepository.exists({
      where: { id: courseUnitId, courseId: courseId },
    });
    if (!exists) {
      throw new CourseUnitNotFoundError(courseId, courseUnitId);
    }

    const assignments = await this.assignmentRepository.find({
      where: { courseUnitId: courseUnitId },
    });
    const courseMaterials = await this.courseMaterialRepository.find({
      where: { courseUnitId: courseUnitId },
    });

    return {
      assignments: plainToInstance(AssignmentContract, assignments, {
        excludeExtraneousValues: true,
      }),
      courseMaterials: plainToInstance(
        CourseMaterialContract,
        courseMaterials,
        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }
}
