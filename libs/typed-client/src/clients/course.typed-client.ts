import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
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

  createCourse(
    data: CoursePatterns['course.create']['request'],
  ): Promise<CoursePatterns['course.create']['response']> {
    return this.rpc('course.create', data);
  }

  findCourseById(
    id: number,
  ): Promise<CoursePatterns['course.findById']['response']> {
    return this.rpc('course.findById', { id });
  }

  findAllCourses(): Promise<CoursePatterns['course.findAll']['response']> {
    return this.rpc('course.findAll', undefined);
  }

  findCoursesByTeacher(
    teacherId: number,
  ): Promise<CoursePatterns['course.findByTeacher']['response']> {
    return this.rpc('course.findByTeacher', { teacherId });
  }

  updateCourse(
    id: number,
    dto: CoursePatterns['course.update']['request']['dto'],
  ): Promise<CoursePatterns['course.update']['response']> {
    return this.rpc('course.update', { id, dto });
  }

  addTeacher(
    id: number,
    teacherId: number,
  ): Promise<CoursePatterns['course.addTeacher']['response']> {
    return this.rpc('course.addTeacher', { id, teacherId });
  }

  removeTeacher(
    id: number,
    teacherId: number,
  ): Promise<CoursePatterns['course.removeTeacher']['response']> {
    return this.rpc('course.removeTeacher', { id, teacherId });
  }

  deleteCourse(
    id: number,
  ): Promise<CoursePatterns['course.delete']['response']> {
    return this.rpc('course.delete', { id });
  }

  createCourseUnit(
    data: CoursePatterns['course-unit.create']['request'],
  ): Promise<CoursePatterns['course-unit.create']['response']> {
    return this.rpc('course-unit.create', data);
  }

  findCourseUnitById(
    id: number,
  ): Promise<CoursePatterns['course-unit.findById']['response']> {
    return this.rpc('course-unit.findById', { id });
  }

  findCourseUnitsByCourse(
    courseId: number,
  ): Promise<CoursePatterns['course-unit.findByCourse']['response']> {
    return this.rpc('course-unit.findByCourse', { courseId });
  }

  updateCourseUnit(
    id: number,
    dto: CoursePatterns['course-unit.update']['request']['dto'],
  ): Promise<CoursePatterns['course-unit.update']['response']> {
    return this.rpc('course-unit.update', { id, dto });
  }

  deleteCourseUnit(
    id: number,
  ): Promise<CoursePatterns['course-unit.delete']['response']> {
    return this.rpc('course-unit.delete', { id });
  }

  createAssignment(
    data: CoursePatterns['assignment.create']['request'],
  ): Promise<CoursePatterns['assignment.create']['response']> {
    return this.rpc('assignment.create', data);
  }

  findAssignmentById(
    id: number,
  ): Promise<CoursePatterns['assignment.findById']['response']> {
    return this.rpc('assignment.findById', { id });
  }

  findAssignmentsByUnit(
    courseUnitId: number,
  ): Promise<CoursePatterns['assignment.findByUnit']['response']> {
    return this.rpc('assignment.findByUnit', { courseUnitId });
  }

  findAssignmentsByCourse(
    courseId: number,
  ): Promise<CoursePatterns['assignment.findByCourse']['response']> {
    return this.rpc('assignment.findByCourse', { courseId });
  }

  updateAssignment(
    id: number,
    dto: CoursePatterns['assignment.update']['request']['dto'],
  ): Promise<CoursePatterns['assignment.update']['response']> {
    return this.rpc('assignment.update', { id, dto });
  }

  deleteAssignment(
    id: number,
  ): Promise<CoursePatterns['assignment.delete']['response']> {
    return this.rpc('assignment.delete', { id });
  }

  createMaterial(
    data: CoursePatterns['material.create']['request'],
  ): Promise<CoursePatterns['material.create']['response']> {
    return this.rpc('material.create', data);
  }

  findMaterialById(
    id: number,
  ): Promise<CoursePatterns['material.findById']['response']> {
    return this.rpc('material.findById', { id });
  }

  findMaterialsByUnit(
    courseUnitId: number,
  ): Promise<CoursePatterns['material.findByUnit']['response']> {
    return this.rpc('material.findByUnit', { courseUnitId });
  }

  updateMaterial(
    id: number,
    dto: CoursePatterns['material.update']['request']['dto'],
  ): Promise<CoursePatterns['material.update']['response']> {
    return this.rpc('material.update', { id, dto });
  }

  deleteMaterial(
    id: number,
  ): Promise<CoursePatterns['material.delete']['response']> {
    return this.rpc('material.delete', { id });
  }
}
