import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Course } from './entities/course.entity';
import { CourseUnit } from './entities/course-unit.entity';
import { FileTypedClient, UserTypedClient } from '@app/typed-client';
import {
  AssignmentBatchDto,
  BatchUpdateCourseDto,
  CourseResponseDto,
  CreateAssignmentDto,
  CreateCourseDto,
  CreateUnitDto,
  UnitDetailDto,
  UpdateAssignmentDto,
  UpdateCourseDto,
  UpdateUnitDto,
} from '@app/contracts';
import { instanceToPlain } from 'class-transformer';
import { Transactional } from 'nestjs-transaction';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(CourseUnit)
    private unitRepo: Repository<CourseUnit>,
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,
    private userClient: UserTypedClient,
    private fileClient: FileTypedClient,
  ) {}

  async findCourseWithUnits(courseId: number): Promise<CourseResponseDto> {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['courseUnits'],
    });
    if (!course) throw new NotFoundException('Course not found');
    return this.toCourseResponse(course);
  }

  async findUnitDetail(unitId: number): Promise<UnitDetailDto> {
    const unit = await this.unitRepo.findOne({
      where: { id: unitId },
      relations: ['assignments', 'courseMaterials'],
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return this.toUnitDetail(unit);
  }

  @Transactional()
  async createCourse(dto: CreateCourseDto, userId: number): Promise<Course> {
    if (dto.teachers?.length) {
      await this.validateUsers(dto.teachers);
    }

    const course = this.courseRepo.create({
      ...instanceToPlain(dto),
      createdBy: userId,
    });
    await this.courseRepo.save(course);

    // TODO: 发布 CourseCreatedEvent
    return course;
  }

  // 添加事务装饰器
  @Transactional()
  async updateCourse(courseId: number, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    if (dto.teachers?.length) {
      await this.validateUsers(dto.teachers);
    }

    Object.assign(course, dto);
    await this.courseRepo.save(course);

    // TODO: 发布 CourseUpdatedEvent
    return course;
  }

  @Transactional()
  async batchUpdateCourse(
    courseId: number,
    dto: BatchUpdateCourseDto,
  ): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['courseUnits', 'courseUnits.assignments'],
    });
    if (!course) throw new NotFoundException('Course not found');

    if (dto.name !== undefined) course.name = dto.name;
    if (dto.description !== undefined) course.description = dto.description;
    if (dto.teachers !== undefined) {
      await this.validateUsers(dto.teachers);
      course.teachers = dto.teachers;
    }
    await this.courseRepo.save(course);

    if (dto.units) {
      const existingUnitsMap = new Map(
        course.courseUnits.map((u) => [u.id, u]),
      );

      for (const unitDto of dto.units) {
        if (unitDto.id && existingUnitsMap.has(unitDto.id)) {
          const unit = existingUnitsMap.get(unitDto.id);
          if (unit === undefined) {
            throw new NotFoundException('Unit not found');
          }
          if (unitDto.title !== undefined) unit.title = unitDto.title;
          if (unitDto.description !== undefined)
            unit.description = unitDto.description;
          if (unitDto.position !== undefined) {
            if (
              this.isPositionConflict(
                course.courseUnits,
                unitDto.position,
                unit.id,
              )
            ) {
              throw new BadRequestException(
                `Position ${String(unitDto.position)} already used`,
              );
            }
            unit.position = unitDto.position;
          }
          await this.unitRepo.save(unit);

          if (unitDto.assignments) {
            await this.processAssignments(unit, unitDto.assignments);
          }
        } else if (!unitDto.id) {
          if (
            unitDto.title === undefined ||
            unitDto.description === undefined ||
            unitDto.position === undefined
          ) {
            throw new BadRequestException();
          }
          if (this.isPositionConflict(course.courseUnits, unitDto.position)) {
            throw new BadRequestException(
              `Position ${String(unitDto.position)} already used`,
            );
          }
          const newUnit = course.addUnit(
            unitDto.title,
            unitDto.description,
            unitDto.position,
          );
          await this.unitRepo.save(newUnit);

          if (unitDto.assignments) {
            await this.processAssignments(newUnit, unitDto.assignments);
          }
        } else {
          throw new BadRequestException(
            `Unit with id ${String(unitDto.id)} not found`,
          );
        }
      }
    }
    return course;
  }

  private async processAssignments(
    unit: CourseUnit,
    assignments: AssignmentBatchDto[],
  ): Promise<void> {
    const existingAssignmentsMap = new Map(
      unit.assignments.map((a) => [a.id, a]),
    );

    for (const aDto of assignments) {
      if (aDto.id && existingAssignmentsMap.has(aDto.id)) {
        const assignment = existingAssignmentsMap.get(aDto.id);
        if (assignment === undefined) {
          throw new NotFoundException('Assignment not found');
        }
        if (aDto.title !== undefined) assignment.title = aDto.title;
        if (aDto.description !== undefined)
          assignment.description = aDto.description;
        if (aDto.dueDate !== undefined) assignment.dueDate = aDto.dueDate;
        if (aDto.attachments !== undefined) {
          await this.validateFiles(aDto.attachments);
          assignment.attachments = aDto.attachments;
        }
        await this.assignmentRepo.save(assignment);
      } else if (!aDto.id) {
        if (
          aDto.title === undefined ||
          aDto.description === undefined ||
          aDto.dueDate === undefined
        ) {
          throw new BadRequestException();
        }
        if (aDto.attachments !== undefined)
          await this.validateFiles(aDto.attachments);
        const assignment = unit.addAssignment(
          aDto.title,
          aDto.description,
          aDto.dueDate,
        );
        if (aDto.attachments) assignment.attachments = aDto.attachments;
        await this.assignmentRepo.save(assignment);
      } else {
        throw new BadRequestException(
          `Assignment with id ${String(aDto.id)} not found`,
        );
      }
    }
  }

  @Transactional()
  async createUnit(courseId: number, dto: CreateUnitDto): Promise<CourseUnit> {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['courseUnits'],
    });
    if (!course) throw new NotFoundException('Course not found');

    if (
      dto.position &&
      this.isPositionConflict(course.courseUnits, dto.position)
    ) {
      throw new BadRequestException(
        `Position ${String(dto.position)} already used`,
      );
    }

    const unit = course.addUnit(dto.title, dto.description, dto.position);
    await this.unitRepo.save(unit);
    // TODO: 发布 UnitAddedEvent
    return unit;
  }

  @Transactional()
  async updateUnit(unitId: number, dto: UpdateUnitDto): Promise<CourseUnit> {
    const unit = await this.unitRepo.findOne({
      where: { id: unitId },
      relations: ['course', 'course.courseUnits'],
    });
    if (!unit) throw new NotFoundException('Unit not found');

    if (dto.position !== undefined && dto.position !== unit.position) {
      if (
        this.isPositionConflict(unit.course.courseUnits, dto.position, unitId)
      ) {
        throw new BadRequestException(
          `Position ${String(dto.position)} already used`,
        );
      }
    }

    if (dto.title !== undefined) unit.title = dto.title;
    if (dto.description !== undefined) unit.description = dto.description;
    if (dto.position !== undefined) unit.position = dto.position;
    await this.unitRepo.save(unit);
    // TODO: 发布 UnitUpdatedEvent
    return unit;
  }

  @Transactional()
  async createAssignment(
    unitId: number,
    dto: CreateAssignmentDto,
  ): Promise<Assignment> {
    const unit = await this.unitRepo.findOne({
      where: { id: unitId },
      relations: ['assignments'],
    });
    if (!unit) throw new NotFoundException('Unit not found');

    if (dto.attachments) await this.validateFiles(dto.attachments);
    const assignment = unit.addAssignment(
      dto.title,
      dto.description,
      dto.dueDate,
    );
    if (dto.attachments) assignment.attachments = dto.attachments;
    await this.assignmentRepo.save(assignment);
    // TODO: 发布 AssignmentCreatedEvent
    return assignment;
  }

  @Transactional()
  async updateAssignment(
    assignmentId: number,
    dto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['courseUnit'],
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    if (dto.title !== undefined) assignment.title = dto.title;
    if (dto.description !== undefined) assignment.description = dto.description;
    if (dto.dueDate !== undefined) assignment.dueDate = dto.dueDate;
    if (dto.attachments !== undefined) {
      await this.validateFiles(dto.attachments);
      assignment.attachments = dto.attachments;
    }
    await this.assignmentRepo.save(assignment);
    // TODO: 发布 AssignmentUpdatedEvent
    return assignment;
  }

  private async validateUsers(userIds: number[]): Promise<void> {
    for (const id of userIds) {
      const exists = await this.userClient.validateUserExists(id);
      if (!exists)
        throw new BadRequestException(`User ${String(id)} not found`);
    }
  }

  private async validateFiles(fileIds: number[]): Promise<void> {
    const exists = await this.fileClient.validateFileExists(fileIds);
    const missingFiles: number[] = [];
    exists.forEach((exist, index) => {
      if (!exist) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        missingFiles.push(fileIds[index]!);
      }
    });
    if (missingFiles.length) {
      throw new BadRequestException(
        `Files not found: ${missingFiles.join(', ')}`,
      );
    }
  }

  private isPositionConflict(
    units: CourseUnit[],
    position: number | undefined,
    excludeUnitId?: number,
  ): boolean {
    if (position === undefined) return false;
    return units.some((u) => u.position === position && u.id !== excludeUnitId);
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
