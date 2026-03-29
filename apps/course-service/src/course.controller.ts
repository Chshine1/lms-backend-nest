import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CourseService } from './course.service';
import {
  CourseContract,
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseUnitDto,
  UpdateCourseUnitDto,
  CourseUnitContract,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  AssignmentContract,
  CreateCourseMaterialDto,
  UpdateCourseMaterialDto,
  CourseMaterialContract,
} from '@app/contracts';
import { ExtractController, CourseTypedClient } from '@app/typed-client';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
  constructor(private readonly courseService: CourseService) {}

  // ==================== Course Endpoints ====================

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.create',
    queue: 'course-service-course-create',
  })
  createCourse(data: CreateCourseDto): Promise<CourseContract> {
    return this.courseService.create(data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.findById',
    queue: 'course-service-course-findById',
  })
  findCourseById(id: number): Promise<CourseContract | null> {
    return this.courseService.findById(id);
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
    routingKey: 'course.findByTeacher',
    queue: 'course-service-course-findByTeacher',
  })
  findCoursesByTeacher(teacherId: number): Promise<CourseContract[]> {
    return this.courseService.findByTeacher(teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.update',
    queue: 'course-service-course-update',
  })
  updateCourse(id: number, dto: UpdateCourseDto): Promise<CourseContract> {
    return this.courseService.update(id, dto);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.addTeacher',
    queue: 'course-service-course-addTeacher',
  })
  addTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.courseService.addTeacher(id, teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.removeTeacher',
    queue: 'course-service-course-removeTeacher',
  })
  removeTeacher(id: number, teacherId: number): Promise<CourseContract> {
    return this.courseService.removeTeacher(id, teacherId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course.delete',
    queue: 'course-service-course-delete',
  })
  deleteCourse(id: number): Promise<void> {
    return this.courseService.delete(id);
  }

  // ==================== Course Unit Endpoints ====================

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.create',
    queue: 'course-service-course-unit-create',
  })
  createCourseUnit(data: CreateCourseUnitDto): Promise<CourseUnitContract> {
    return this.courseService.createUnit(data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.findById',
    queue: 'course-service-course-unit-findById',
  })
  findCourseUnitById(id: number): Promise<CourseUnitContract | null> {
    return this.courseService.findUnitById(id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.findByCourse',
    queue: 'course-service-course-unit-findByCourse',
  })
  findCourseUnitsByCourse(courseId: number): Promise<CourseUnitContract[]> {
    return this.courseService.findUnitsByCourse(courseId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.update',
    queue: 'course-service-course-unit-update',
  })
  updateCourseUnit(
    id: number,
    dto: UpdateCourseUnitDto,
  ): Promise<CourseUnitContract> {
    return this.courseService.updateUnit(id, dto);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'course-unit.delete',
    queue: 'course-service-course-unit-delete',
  })
  deleteCourseUnit(id: number): Promise<void> {
    return this.courseService.deleteUnit(id);
  }

  // ==================== Assignment Endpoints ====================

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.create',
    queue: 'course-service-assignment-create',
  })
  createAssignment(data: CreateAssignmentDto): Promise<AssignmentContract> {
    return this.courseService.createAssignment(data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.findById',
    queue: 'course-service-assignment-findById',
  })
  findAssignmentById(id: number): Promise<AssignmentContract | null> {
    return this.courseService.findAssignmentById(id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.findByUnit',
    queue: 'course-service-assignment-findByUnit',
  })
  findAssignmentsByUnit(courseUnitId: number): Promise<AssignmentContract[]> {
    return this.courseService.findAssignmentsByUnit(courseUnitId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.findByCourse',
    queue: 'course-service-assignment-findByCourse',
  })
  findAssignmentsByCourse(courseId: number): Promise<AssignmentContract[]> {
    return this.courseService.findAssignmentsByCourse(courseId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.update',
    queue: 'course-service-assignment-update',
  })
  updateAssignment(
    id: number,
    dto: UpdateAssignmentDto,
  ): Promise<AssignmentContract> {
    return this.courseService.updateAssignment(id, dto);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'assignment.delete',
    queue: 'course-service-assignment-delete',
  })
  deleteAssignment(id: number): Promise<void> {
    return this.courseService.deleteAssignment(id);
  }

  // ==================== Course Material Endpoints ====================

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'material.create',
    queue: 'course-service-material-create',
  })
  createMaterial(
    data: CreateCourseMaterialDto,
  ): Promise<CourseMaterialContract> {
    return this.courseService.createMaterial(data);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'material.findById',
    queue: 'course-service-material-findById',
  })
  findMaterialById(id: number): Promise<CourseMaterialContract | null> {
    return this.courseService.findMaterialById(id);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'material.findByUnit',
    queue: 'course-service-material-findByUnit',
  })
  findMaterialsByUnit(courseUnitId: number): Promise<CourseMaterialContract[]> {
    return this.courseService.findMaterialsByUnit(courseUnitId);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'material.update',
    queue: 'course-service-material-update',
  })
  updateMaterial(
    id: number,
    dto: UpdateCourseMaterialDto,
  ): Promise<CourseMaterialContract> {
    return this.courseService.updateMaterial(id, dto);
  }

  @RabbitRPC({
    exchange: 'course-service',
    routingKey: 'material.delete',
    queue: 'course-service-material-delete',
  })
  deleteMaterial(id: number): Promise<void> {
    return this.courseService.deleteMaterial(id);
  }
}
