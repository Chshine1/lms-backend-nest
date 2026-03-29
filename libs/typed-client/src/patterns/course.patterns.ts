import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseContract,
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

export interface CoursePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'course.create': {
    request: CreateCourseDto;
    response: CourseContract;
  };
  'course.findById': {
    request: { id: number };
    response: CourseContract | null;
  };
  'course.findAll': {
    request: void;
    response: CourseContract[];
  };
  'course.findByTeacher': {
    request: { teacherId: number };
    response: CourseContract[];
  };
  'course.update': {
    request: { id: number; dto: UpdateCourseDto };
    response: CourseContract;
  };
  'course.addTeacher': {
    request: { id: number; teacherId: number };
    response: CourseContract;
  };
  'course.removeTeacher': {
    request: { id: number; teacherId: number };
    response: CourseContract;
  };
  'course.delete': {
    request: { id: number };
    response: void;
  };
  'course-unit.create': {
    request: CreateCourseUnitDto;
    response: CourseUnitContract;
  };
  'course-unit.findById': {
    request: { id: number };
    response: CourseUnitContract | null;
  };
  'course-unit.findByCourse': {
    request: { courseId: number };
    response: CourseUnitContract[];
  };
  'course-unit.update': {
    request: { id: number; dto: UpdateCourseUnitDto };
    response: CourseUnitContract;
  };
  'course-unit.delete': {
    request: { id: number };
    response: void;
  };
  'assignment.create': {
    request: CreateAssignmentDto;
    response: AssignmentContract;
  };
  'assignment.findById': {
    request: { id: number };
    response: AssignmentContract | null;
  };
  'assignment.findByUnit': {
    request: { courseUnitId: number };
    response: AssignmentContract[];
  };
  'assignment.findByCourse': {
    request: { courseId: number };
    response: AssignmentContract[];
  };
  'assignment.update': {
    request: { id: number; dto: UpdateAssignmentDto };
    response: AssignmentContract;
  };
  'assignment.delete': {
    request: { id: number };
    response: void;
  };
  'material.create': {
    request: CreateCourseMaterialDto;
    response: CourseMaterialContract;
  };
  'material.findById': {
    request: { id: number };
    response: CourseMaterialContract | null;
  };
  'material.findByUnit': {
    request: { courseUnitId: number };
    response: CourseMaterialContract[];
  };
  'material.update': {
    request: { id: number; dto: UpdateCourseMaterialDto };
    response: CourseMaterialContract;
  };
  'material.delete': {
    request: { id: number };
    response: void;
  };
}
