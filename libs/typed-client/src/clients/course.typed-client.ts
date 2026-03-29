import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import {
  CourseContract,
  CourseUnitContract,
  AssignmentContract,
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseUnitDto,
  UpdateCourseUnitDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from '@app/contracts';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '../typed-client.module';
import { CoursePatterns } from '../patterns/course.patterns';
import { TraceService } from '@app/trace';

@Injectable()
export class CourseTypedClient extends TypedClientBase<CoursePatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, traceService, options);
  }

  createCourse(dto: CreateCourseDto): Promise<CourseContract> {
    return this.rpc('course.create', dto);
  }

  findCourseById(id: number): Promise<CourseContract | null> {
    return this.rpc('course.findById', { id });
  }

  findAllCourses(): Promise<CourseContract[]> {
    return this.rpc('course.findAll', {});
  }

  findCoursesByIds(ids: number[]): Promise<CourseContract[]> {
    return this.rpc('course.findByIds', { ids });
  }

  findCoursesByTeacher(teacherId: number): Promise<CourseContract[]> {
    return this.rpc('course.findByTeacher', { teacherId });
  }

  updateCourse(id: number, dto: UpdateCourseDto): Promise<CourseContract> {
    return this.rpc('course.update', { id, ...dto });
  }

  updateCourseTeachers(
    id: number,
    teachers: number[],
  ): Promise<CourseContract> {
    return this.rpc('course.updateTeachers', { id, teachers });
  }

  addTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.rpc('course.addTeacher', { id, teacherId });
  }

  removeTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.rpc('course.removeTeacher', { id, teacherId });
  }

  deleteCourse(id: number): Promise<void> {
    return this.rpc('course.delete', { id });
  }

  createUnit(dto: CreateCourseUnitDto): Promise<CourseUnitContract> {
    return this.rpc('course-unit.create', dto);
  }

  findUnitById(id: number): Promise<CourseUnitContract | null> {
    return this.rpc('course-unit.findById', { id });
  }

  findUnitsByCourse(courseId: number): Promise<CourseUnitContract[]> {
    return this.rpc('course-unit.findByCourse', { courseId });
  }

  updateUnit(
    id: number,
    dto: UpdateCourseUnitDto,
  ): Promise<CourseUnitContract> {
    return this.rpc('course-unit.update', { id, ...dto });
  }

  deleteUnit(id: number): Promise<void> {
    return this.rpc('course-unit.delete', { id });
  }

  createAssignment(dto: CreateAssignmentDto): Promise<AssignmentContract> {
    return this.rpc('assignment.create', dto);
  }

  findAssignmentById(id: number): Promise<AssignmentContract | null> {
    return this.rpc('assignment.findById', { id });
  }

  findAssignmentsByUnit(courseUnitId: number): Promise<AssignmentContract[]> {
    return this.rpc('assignment.findByUnit', { courseUnitId });
  }

  findAssignmentsByCourse(courseId: number): Promise<AssignmentContract[]> {
    return this.rpc('assignment.findByCourse', { courseId });
  }

  updateAssignment(
    id: number,
    dto: UpdateAssignmentDto,
  ): Promise<AssignmentContract> {
    return this.rpc('assignment.update', { id, ...dto });
  }

  deleteAssignment(id: number): Promise<void> {
    return this.rpc('assignment.delete', { id });
  }
}
