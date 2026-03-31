import {
  AssignmentContract,
  BatchUpdateCourseDto,
  CourseContract,
  CourseMaterialContract,
  CourseUnitContract,
  CreateCourseDto,
} from '@app/contracts';

export interface CoursePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'course.create': {
    request: CreateCourseDto;
    response: CourseContract;
  };
  'course.batch-update': {
    request: {
      courseId: number;
      data: BatchUpdateCourseDto;
    };
    response: CourseContract;
  };
  'course.find-course-with-units': {
    request: {
      courseId: number;
    };
    response: {
      course: CourseContract;
      courseUnits: CourseUnitContract[];
    };
  };
  'course.find-unit-detail': {
    request: {
      courseId: number;
      courseUnitId: number;
    };
    response: {
      assignments: AssignmentContract[];
      courseMaterials: CourseMaterialContract[];
    };
  };
}
