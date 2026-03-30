import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '@/course-service/src/entities/course.entity';
import { Repository } from 'typeorm';
import { CourseUnit } from '@/course-service/src/entities/course-unit.entity';
import { CourseResponseDto, UnitDetailDto } from '@app/contracts';

@Injectable()
export class CourseReadService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseUnit)
    private unitRepository: Repository<CourseUnit>,
  ) {}

  async findCourseWithUnits(courseId: number): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseUnits'],
    });
    if (!course) throw new NotFoundException('Course not found');
    return this.toCourseResponse(course);
  }

  async findUnitDetail(unitId: number): Promise<UnitDetailDto> {
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: ['assignments', 'courseMaterials'],
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return this.toUnitDetail(unit);
  }

  private toCourseResponse(course: Course): CourseResponseDto {
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      tenantId: course.tenantId,
      teachers: course.teachers,
      createdBy: course.createdBy,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      courseUnits: course.courseUnits.map((u) => ({
        id: u.id,
        title: u.title,
        position: u.position,
      })),
    };
  }

  private toUnitDetail(unit: CourseUnit): UnitDetailDto {
    return {
      id: unit.id,
      title: unit.title,
      position: unit.position,
      description: unit.description,
      assignments: unit.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
      })),
      courseMaterials: unit.courseMaterials.map((m) => ({
        id: m.id,
        title: m.title,
        fileId: m.fileId,
      })),
    };
  }
}
