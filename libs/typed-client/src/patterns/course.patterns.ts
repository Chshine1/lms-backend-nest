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
    request: Record<string, never>;
    response: CourseContract[];
  };
  'course.findByIds': {
    request: { ids: number[] };
    response: CourseContract[];
  };
  'course.findByTeacher': {
    request: { teacherId: number };
    response: CourseContract[];
  };
  'course.update': {
    request: { id: number } & UpdateCourseDto;
    response: CourseContract;
  };
  'course.updateTeachers': {
    request: { id: number; teachers: number[] };
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
    request: { id: number } & UpdateCourseUnitDto;
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
    request: { id: number } & UpdateAssignmentDto;
    response: AssignmentContract;
  };
  'assignment.delete': {
    request: { id: number };
    response: void;
  };
}
