import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseService } from './course.service';
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
import { CourseTypedClient, ExtractController } from '@app/typed-client';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(private readonly courseService: CourseService) {}

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.create',
    queue: 'course-service-course-create',
  })
  createCourse(dto: CreateCourseDto): Promise<CourseContract> {
    return this.courseService.create(dto);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findById',
    queue: 'course-service-course-findById',
  })
  findCourseById(data: { id: number }): Promise<CourseContract | null> {
    return this.courseService.findById(data.id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findAll',
    queue: 'course-service-course-findAll',
  })
  findAllCourses(): Promise<CourseContract[]> {
    return this.courseService.findAll();
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findByIds',
    queue: 'course-service-course-findByIds',
  })
  findCoursesByIds(data: { ids: number[] }): Promise<CourseContract[]> {
    return this.courseService.findByIds(data.ids);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findByTeacher',
    queue: 'course-service-course-findByTeacher',
  })
  findCoursesByTeacher(data: { teacherId: number }): Promise<CourseContract[]> {
    return this.courseService.findByTeacher(data.teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.update',
    queue: 'course-service-course-update',
  })
  updateCourse(
    data: { id: number } & UpdateCourseDto,
  ): Promise<CourseContract> {
    return this.courseService.update(data.id, data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.updateTeachers',
    queue: 'course-service-course-updateTeachers',
  })
  updateCourseTeachers(data: {
    id: number;
    teachers: number[];
  }): Promise<CourseContract> {
    return this.courseService.updateTeachers(data.id, data.teachers);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.addTeacher',
    queue: 'course-service-course-addTeacher',
  })
  addTeacher(data: { id: number; teacherId: number }): Promise<CourseContract> {
    return this.courseService.addTeacher(data.id, data.teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.removeTeacher',
    queue: 'course-service-course-removeTeacher',
  })
  removeTeacher(data: {
    id: number;
    teacherId: number;
  }): Promise<CourseContract> {
    return this.courseService.removeTeacher(data.id, data.teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.delete',
    queue: 'course-service-course-delete',
  })
  deleteCourse(data: { id: number }): Promise<void> {
    return this.courseService.delete(data.id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.create',
    queue: 'course-service-course-unit-create',
  })
  createUnit(dto: CreateCourseUnitDto): Promise<CourseUnitContract> {
    return this.courseService.createUnit(dto);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.findById',
    queue: 'course-service-course-unit-findById',
  })
  findUnitById(data: { id: number }): Promise<CourseUnitContract | null> {
    return this.courseService.findUnitById(data.id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.findByCourse',
    queue: 'course-service-course-unit-findByCourse',
  })
  findUnitsByCourse(data: { courseId: number }): Promise<CourseUnitContract[]> {
    return this.courseService.findUnitsByCourse(data.courseId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.update',
    queue: 'course-service-course-unit-update',
  })
  updateUnit(
    data: { id: number } & UpdateCourseUnitDto,
  ): Promise<CourseUnitContract> {
    return this.courseService.updateUnit(data.id, data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.delete',
    queue: 'course-service-course-unit-delete',
  })
  deleteUnit(data: { id: number }): Promise<void> {
    return this.courseService.deleteUnit(data.id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.create',
    queue: 'course-service-assignment-create',
  })
  createAssignment(dto: CreateAssignmentDto): Promise<AssignmentContract> {
    return this.courseService.createAssignment(dto);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.findById',
    queue: 'course-service-assignment-findById',
  })
  findAssignmentById(data: { id: number }): Promise<AssignmentContract | null> {
    return this.courseService.findAssignmentById(data.id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.findByUnit',
    queue: 'course-service-assignment-findByUnit',
  })
  findAssignmentsByUnit(data: {
    courseUnitId: number;
  }): Promise<AssignmentContract[]> {
    return this.courseService.findAssignmentsByUnit(data.courseUnitId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.findByCourse',
    queue: 'course-service-assignment-findByCourse',
  })
  findAssignmentsByCourse(data: {
    courseId: number;
  }): Promise<AssignmentContract[]> {
    return this.courseService.findAssignmentsByCourse(data.courseId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.update',
    queue: 'course-service-assignment-update',
  })
  updateAssignment(
    data: { id: number } & UpdateAssignmentDto,
  ): Promise<AssignmentContract> {
    return this.courseService.updateAssignment(data.id, data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.delete',
    queue: 'course-service-assignment-delete',
  })
  deleteAssignment(data: { id: number }): Promise<void> {
    return this.courseService.deleteAssignment(data.id);
  }
}
