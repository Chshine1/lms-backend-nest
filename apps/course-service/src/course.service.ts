import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseUnit } from './entities/course-unit.entity';
import { Assignment } from './entities/assignment.entity';
import {
  CourseContract,
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseUnitDto,
  UpdateCourseUnitDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CourseUnitContract,
  AssignmentContract,
} from '@app/contracts';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseUnit)
    private courseUnitRepository: Repository<CourseUnit>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseContract> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      teachers: createCourseDto.teachers ?? [],
    });
    const savedCourse = await this.courseRepository.save(course);
    return plainToInstance(CourseContract, savedCourse, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<CourseContract | null> {
    const findResult = await this.courseRepository.findOne({ where: { id } });
    if (findResult === null) return null;
    return plainToInstance(CourseContract, findResult, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<CourseContract[]> {
    const courses = await this.courseRepository.find();
    return plainToInstance(CourseContract, courses, {
      excludeExtraneousValues: true,
    });
  }

  async findByIds(ids: number[]): Promise<CourseContract[]> {
    const courses = await this.courseRepository.findByIds(ids);
    return plainToInstance(CourseContract, courses, {
      excludeExtraneousValues: true,
    });
  }

  async findByTeacher(teacherId: number): Promise<CourseContract[]> {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.teachers @> :teacherId', {
        teacherId: JSON.stringify([teacherId]),
      })
      .getMany();
    return plainToInstance(CourseContract, courses, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseContract> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (course === null) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }
    const updatedCourse = this.courseRepository.merge(course, updateCourseDto);
    const savedCourse = await this.courseRepository.save(updatedCourse);
    return plainToInstance(CourseContract, savedCourse, {
      excludeExtraneousValues: true,
    });
  }

  async updateTeachers(
    id: number,
    teachers: number[],
  ): Promise<CourseContract> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (course === null) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }
    course.teachers = teachers;
    const savedCourse = await this.courseRepository.save(course);
    return plainToInstance(CourseContract, savedCourse, {
      excludeExtraneousValues: true,
    });
  }

  async addTeacher(id: number, teacherId: number): Promise<CourseContract> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (course === null) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }
    if (!course.teachers.includes(teacherId)) {
      course.teachers.push(teacherId);
      const savedCourse = await this.courseRepository.save(course);
      return plainToInstance(CourseContract, savedCourse, {
        excludeExtraneousValues: true,
      });
    }
    return plainToInstance(CourseContract, course, {
      excludeExtraneousValues: true,
    });
  }

  async removeTeacher(id: number, teacherId: number): Promise<CourseContract> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (course === null) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }
    course.teachers = course.teachers.filter((t) => t !== teacherId);
    const savedCourse = await this.courseRepository.save(course);
    return plainToInstance(CourseContract, savedCourse, {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: number): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (course === null) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }
    await this.courseRepository.softDelete(id);
  }

  async createUnit(
    createCourseUnitDto: CreateCourseUnitDto,
  ): Promise<CourseUnitContract> {
    const unit = this.courseUnitRepository.create(createCourseUnitDto);
    const savedUnit = await this.courseUnitRepository.save(unit);
    return plainToInstance(CourseUnitContract, savedUnit, {
      excludeExtraneousValues: true,
    });
  }

  async findUnitById(id: number): Promise<CourseUnitContract | null> {
    const unit = await this.courseUnitRepository.findOne({
      where: { id },
      relations: ['course'],
    });
    if (unit === null) return null;
    return plainToInstance(CourseUnitContract, unit, {
      excludeExtraneousValues: true,
    });
  }

  async findUnitsByCourse(courseId: number): Promise<CourseUnitContract[]> {
    const units = await this.courseUnitRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
    return plainToInstance(CourseUnitContract, units, {
      excludeExtraneousValues: true,
    });
  }

  async updateUnit(
    id: number,
    updateCourseUnitDto: UpdateCourseUnitDto,
  ): Promise<CourseUnitContract> {
    const unit = await this.courseUnitRepository.findOne({ where: { id } });
    if (unit === null) {
      throw new NotFoundException(`Course unit with id ${id} not found`);
    }
    const updatedUnit = this.courseUnitRepository.merge(
      unit,
      updateCourseUnitDto,
    );
    const savedUnit = await this.courseUnitRepository.save(updatedUnit);
    return plainToInstance(CourseUnitContract, savedUnit, {
      excludeExtraneousValues: true,
    });
  }

  async deleteUnit(id: number): Promise<void> {
    const unit = await this.courseUnitRepository.findOne({ where: { id } });
    if (unit === null) {
      throw new NotFoundException(`Course unit with id ${id} not found`);
    }
    await this.courseUnitRepository.softDelete(id);
  }

  async createAssignment(
    createAssignmentDto: CreateAssignmentDto,
  ): Promise<AssignmentContract> {
    const assignment = this.assignmentRepository.create(createAssignmentDto);
    const savedAssignment = await this.assignmentRepository.save(assignment);
    return plainToInstance(AssignmentContract, savedAssignment, {
      excludeExtraneousValues: true,
    });
  }

  async findAssignmentById(id: number): Promise<AssignmentContract | null> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['courseUnit'],
    });
    if (assignment === null) return null;
    return plainToInstance(AssignmentContract, assignment, {
      excludeExtraneousValues: true,
    });
  }

  async findAssignmentsByUnit(
    courseUnitId: number,
  ): Promise<AssignmentContract[]> {
    const assignments = await this.assignmentRepository.find({
      where: { courseUnitId },
      order: { order: 'ASC' },
    });
    return plainToInstance(AssignmentContract, assignments, {
      excludeExtraneousValues: true,
    });
  }

  async findAssignmentsByCourse(
    courseId: number,
  ): Promise<AssignmentContract[]> {
    const assignments = await this.assignmentRepository
      .createQueryBuilder('assignment')
      .innerJoin('assignment.courseUnit', 'unit')
      .where('unit.courseId = :courseId', { courseId })
      .orderBy('unit.order', 'ASC')
      .addOrderBy('assignment.order', 'ASC')
      .getMany();
    return plainToInstance(AssignmentContract, assignments, {
      excludeExtraneousValues: true,
    });
  }

  async updateAssignment(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<AssignmentContract> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
    });
    if (assignment === null) {
      throw new NotFoundException(`Assignment with id ${id} not found`);
    }
    const updatedAssignment = this.assignmentRepository.merge(
      assignment,
      updateAssignmentDto,
    );
    const savedAssignment =
      await this.assignmentRepository.save(updatedAssignment);
    return plainToInstance(AssignmentContract, savedAssignment, {
      excludeExtraneousValues: true,
    });
  }

  async deleteAssignment(id: number): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
    });
    if (assignment === null) {
      throw new NotFoundException(`Assignment with id ${id} not found`);
    }
    await this.assignmentRepository.softDelete(id);
  }
}
