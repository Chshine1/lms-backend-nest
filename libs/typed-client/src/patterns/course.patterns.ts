import { CourseContract } from '@app/contracts/course/entities/course.contract';

export interface CoursePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'course.findById': {
    request: { id: number };
    response: CourseContract | null;
  };
}
