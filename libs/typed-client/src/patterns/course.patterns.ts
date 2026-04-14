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
}
