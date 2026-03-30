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
import { Assignment } from '@/course-service/src/entities/assignment.entity';
import { CourseMaterial } from '@/course-service/src/entities/course-material.entity';

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
    assignments: AssignmentContract[];
    courseMaterials: CourseMaterialContract[];
  }> {
    const exists = await this.unitRepository.exists({ where: { id: unitId } });
    if (!exists) {
      throw new NotFoundException('Unit not found');
    }

    const assignments = await this.assignmentRepository.find({
      where: { courseUnitId: unitId },
    });
    const courseMaterials = await this.courseMaterialRepository.find({
      where: { courseUnitId: unitId },
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
