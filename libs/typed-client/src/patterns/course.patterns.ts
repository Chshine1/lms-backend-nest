import { CreateCourseDto, CourseDto } from '@app/contracts';

export interface CoursePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'course.create': {
    request: {
      dto: CreateCourseDto;
      creatorUserId: bigint;
    };
    response: CourseDto;
  };
  'course.find-by-id': {
    request: {
      courseId: bigint;
    };
    response: CourseDto | null;
  };
  'course.find-course-with-units': {
    request: {
      courseId: bigint;
    };
    response: {
      course: CourseDto;
      courseUnits: Array<{
        id: bigint;
        courseId: bigint;
        title: string;
        description?: string;
        position: number;
      }>;
    };
  };
  'course.find-unit-detail': {
    request: {
      courseId: bigint;
      courseUnitId: bigint;
    };
    response: {
      assignments: Array<{
        id: bigint;
        courseUnitId: bigint;
        title: string;
        description: string;
        dueDate: Date;
        attachments: bigint[];
      }>;
      courseMaterials: Array<{
        id: bigint;
        courseUnitId: bigint;
        fileId: bigint;
        title: string;
      }>;
    };
  };
  'course.enroll-student': {
    request: {
      courseId: bigint;
      studentId: bigint;
      enrollerUserId: bigint;
    };
    response: void;
  };
}
