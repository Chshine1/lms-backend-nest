import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseUnit } from './entities/course-unit.entity';
import { Assignment } from './entities/assignment.entity';
import { CourseMaterial } from './entities/course-material.entity';
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
  CreateCourseMaterialDto,
  UpdateCourseMaterialDto,
  CourseMaterialContract,
  IdentityType,
  UserContract,
} from '@app/contracts';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserTypedClient } from '@app/typed-client';
import { type Request } from 'express';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseUnit)
    private courseUnitRepository: Repository<CourseUnit>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(CourseMaterial)
    private courseMaterialRepository: Repository<CourseMaterial>,
    private userClient: UserTypedClient,
  ) {}

  // ==================== Course Operations ====================

  async create(
    createCourseDto: CreateCourseDto,
    request: Request,
  ): Promise<CourseContract> {
    // TODO: Just perform lightweight validation
    const tenant = await this.userClient.validateTenant(
      createCourseDto.tenantId,
    );
    if (tenant === null) {
      throw new NotFoundException(
        `Tenant ${String(createCourseDto.tenantId)} not found or inactive`,
      );
    }

    // Cross-service: Validate creator user exists
    const userId = request.user?.id;
    let creator: UserContract | null = null;
    if (userId !== undefined) {
      creator = await this.userClient.findUserById(userId);
    }
    if (creator === null) {
      throw new NotFoundException(`User ${String(userId)} not found`);
    }

    // TODO: Simplify?
    // Cross-service: Validate all teachers exist and have teacher identity type
    if (createCourseDto.teachers && createCourseDto.teachers.length > 0) {
      await this.validateTeachers(
        createCourseDto.teachers,
        createCourseDto.tenantId,
      );
    }

    const course = this.courseRepository.create({
      ...instanceToPlain(createCourseDto),
      teachers: createCourseDto.teachers ?? [],
    });
    const savedCourse = await this.courseRepository.save(course);
    this.logger.log(
      `Course created: id=${String(savedCourse.id)}, tenant=${String(savedCourse.tenantId)}`,
    );

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
    // Cross-service: Validate tenant if being changed
    if (updateCourseDto.tenantId) {
      const tenant = await this.userClient.validateTenant(
        updateCourseDto.tenantId,
      );
      if (!tenant) {
        throw new NotFoundException(
          `Tenant ${String(updateCourseDto.tenantId)} not found or inactive`,
        );
      }
    }

    // Cross-service: Validate all new teachers
    if (updateCourseDto.teachers && updateCourseDto.teachers.length > 0) {
      const course = await this.courseRepository.findOne({ where: { id } });
      const tenantId = updateCourseDto.tenantId ?? course?.tenantId ?? 0;
      await this.validateTeachers(updateCourseDto.teachers, tenantId);
    }

    const course = await this.courseRepository.findOne({ where: { id } });
    if (course === null) {
      throw new NotFoundException(`Course with id ${String(id)} not found`);
    }
    const updatedCourse = this.courseRepository.merge(course, updateCourseDto);
    const savedCourse = await this.courseRepository.save(updatedCourse);
    return plainToInstance(CourseContract, savedCourse, {
      excludeExtraneousValues: true,
    });
  }

  async addTeacher(id: number, teacherId: number): Promise<CourseContract> {
    // Cross-service: Validate teacher exists and has TEACHER identity type
    const user = await this.userClient.findUserById(teacherId);
    if (!user) {
      throw new NotFoundException(
        `Teacher with id ${String(teacherId)} not found`,
      );
    }
    if (user.identityType !== IdentityType.TEACHER) {
      throw new NotFoundException(`User ${String(teacherId)} is not a teacher`);
    }

    const course = await this.courseRepository.findOne({ where: { id } });
    if (course === null) {
      throw new NotFoundException(`Course with id ${String(id)} not found`);
    }

    // Ensure tenant consistency
    if (user.tenantId !== course.tenantId) {
      throw new Error(
        `Teacher ${String(teacherId)} does not belong to tenant ${String(course.tenantId)}`,
      );
    }

    if (!course.teachers.includes(teacherId)) {
      course.teachers.push(teacherId);
      const savedCourse = await this.courseRepository.save(course);

      // Domain event: Notify scheduling-service that a teacher was added
      this.logger.log(
        `Teacher ${String(teacherId)} added to course ${String(id)}`,
      );

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
      throw new NotFoundException(`Course with id ${String(id)} not found`);
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
      throw new NotFoundException(`Course with id ${String(id)} not found`);
    }

    await this.courseRepository.softDelete(id);

    // TODO: Publish domain event 'course.deleted' for eventual consistency
    // Dependent services should consume:
    // - course-enrollment-service: delete related enrollments
    // - course-scheduling-service: delete related schedules
    // Implementation: Use RabbitMQOutboxService for reliable event delivery
    this.logger.log(
      `Course deleted: id=${String(id)}. ` +
        `TODO: Publish course.deleted event for enrollment-service and scheduling-service cleanup`,
    );
  }

  // ==================== Course Unit Operations ====================

  async createUnit(
    createCourseUnitDto: CreateCourseUnitDto,
  ): Promise<CourseUnitContract> {
    // Validate course exists
    const course = await this.courseRepository.findOne({
      where: { id: createCourseUnitDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Course ${String(createCourseUnitDto.courseId)} not found`,
      );
    }

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
      order: { position: 'ASC' },
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
      throw new NotFoundException(
        `Course unit with id ${String(id)} not found`,
      );
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
      throw new NotFoundException(
        `Course unit with id ${String(id)} not found`,
      );
    }

    await this.courseUnitRepository.softDelete(id);

    // TODO: Publish domain event 'course-unit.deleted' for assignment-service
    // to handle cascade deletion of related assignments
    this.logger.log(
      `Course unit deleted: id=${String(id)}. ` +
        `TODO: Publish course-unit.deleted event for assignment-service cleanup`,
    );
  }

  // ==================== Assignment Operations ====================

  async createAssignment(
    createAssignmentDto: CreateAssignmentDto,
  ): Promise<AssignmentContract> {
    // Validate course unit exists
    const unit = await this.courseUnitRepository.findOne({
      where: { id: createAssignmentDto.courseUnitId },
    });
    if (!unit) {
      throw new NotFoundException(
        `Course unit ${String(createAssignmentDto.courseUnitId)} not found`,
      );
    }

    // Cross-service: Validate attachments exist in file-service
    if (
      createAssignmentDto.attachments &&
      createAssignmentDto.attachments.length > 0
    ) {
      // TODO: Add file-service validation when FileTypedClient is available
      // await this.fileClient.validateFiles(createAssignmentDto.attachments);
    }

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
      order: { dueDate: 'ASC' },
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
      .addOrderBy('assignment.dueDate', 'ASC')
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
      throw new NotFoundException(`Assignment with id ${String(id)} not found`);
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
      throw new NotFoundException(`Assignment with id ${String(id)} not found`);
    }
    await this.assignmentRepository.softDelete(id);
  }

  // ==================== Course Material Operations ====================

  async createMaterial(
    createCourseMaterialDto: CreateCourseMaterialDto,
  ): Promise<CourseMaterialContract> {
    // Cross-service: Validate uploader exists
    const uploader = await this.userClient.findUserById(
      createCourseMaterialDto.uploaderId,
    );
    if (!uploader) {
      throw new NotFoundException(
        `User ${String(createCourseMaterialDto.uploaderId)} not found`,
      );
    }

    // Validate course unit exists
    const unit = await this.courseUnitRepository.findOne({
      where: { id: createCourseMaterialDto.courseUnitId },
    });
    if (!unit) {
      throw new NotFoundException(
        `Course unit ${String(createCourseMaterialDto.courseUnitId)} not found`,
      );
    }

    // Cross-service: Validate file exists in file-service
    // TODO: Add file-service validation when FileTypedClient is available
    // await this.fileClient.validateFile(createCourseMaterialDto.fileId);

    const material = this.courseMaterialRepository.create(
      createCourseMaterialDto,
    );
    const savedMaterial = await this.courseMaterialRepository.save(material);
    return plainToInstance(CourseMaterialContract, savedMaterial, {
      excludeExtraneousValues: true,
    });
  }

  async findMaterialById(id: number): Promise<CourseMaterialContract | null> {
    const material = await this.courseMaterialRepository.findOne({
      where: { id },
      relations: ['courseUnit'],
    });
    if (material === null) return null;
    return plainToInstance(CourseMaterialContract, material, {
      excludeExtraneousValues: true,
    });
  }

  async findMaterialsByUnit(
    courseUnitId: number,
  ): Promise<CourseMaterialContract[]> {
    const materials = await this.courseMaterialRepository.find({
      where: { courseUnitId },
    });
    return plainToInstance(CourseMaterialContract, materials, {
      excludeExtraneousValues: true,
    });
  }

  async updateMaterial(
    id: number,
    updateCourseMaterialDto: UpdateCourseMaterialDto,
  ): Promise<CourseMaterialContract> {
    const material = await this.courseMaterialRepository.findOne({
      where: { id },
    });
    if (material === null) {
      throw new NotFoundException(
        `Course material with id ${String(id)} not found`,
      );
    }

    const updatedMaterial = this.courseMaterialRepository.merge(
      material,
      updateCourseMaterialDto,
    );
    const savedMaterial =
      await this.courseMaterialRepository.save(updatedMaterial);
    return plainToInstance(CourseMaterialContract, savedMaterial, {
      excludeExtraneousValues: true,
    });
  }

  async deleteMaterial(id: number): Promise<void> {
    const material = await this.courseMaterialRepository.findOne({
      where: { id },
    });
    if (material === null) {
      throw new NotFoundException(
        `Course material with id ${String(id)} not found`,
      );
    }
    await this.courseMaterialRepository.softDelete(id);
  }

  // ==================== Private Helpers ====================

  private async validateTeachers(
    teacherIds: number[],
    tenantId: number,
  ): Promise<void> {
    const results = await Promise.allSettled(
      teacherIds.map((teacherId) => this.userClient.findUserById(teacherId)),
    );

    const invalidTeachers: number[] = [];
    results.forEach((result, index) => {
      const teacherId = teacherIds[index];
      if (teacherId === undefined) return;

      if (result.status === 'rejected' || !result.value) {
        invalidTeachers.push(teacherId);
      } else if (result.value.identityType !== IdentityType.TEACHER) {
        invalidTeachers.push(teacherId);
      } else if (result.value.tenantId !== tenantId) {
        invalidTeachers.push(teacherId);
      }
    });

    if (invalidTeachers.length > 0) {
      throw new Error(
        `Invalid teachers: ${invalidTeachers.join(', ')}. ` +
          `They must exist, have TEACHER identity type, and belong to tenant ${String(tenantId)}`,
      );
    }
  }
}
