import { CourseContract } from '@app/contracts';

export interface CoursePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'course.findById': {
    request: { id: number };
    response: CourseContract | null;
  };
}
