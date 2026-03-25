import {
  CourseScheduleContract,
  CreateScheduleDto,
  UpdateScheduleDto,
} from '@app/contracts';

export interface CourseSchedulingPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'course-scheduling.create': {
    request: CreateScheduleDto;
    response: CourseScheduleContract;
  };
  'course-scheduling.getByCourse': {
    request: { courseId: number };
    response: CourseScheduleContract[];
  };
  'course-scheduling.getById': {
    request: { id: number };
    response: CourseScheduleContract;
  };
  'course-scheduling.update': {
    request: { id: number } & UpdateScheduleDto;
    response: CourseScheduleContract;
  };
  'course-scheduling.delete': {
    request: { id: number };
    response: never;
  };
}
