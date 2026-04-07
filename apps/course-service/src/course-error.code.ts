import { LogLevel } from '@app/contracts';

export const CourseErrorCode = {
  COURSE_NOT_FOUND: '0600',
  COURSE_UNIT_NOT_FOUND: '0601',
  COURSE_INVALID_TEACHERS: '0602',
  COURSE_ASSIGNMENT_NOT_FOUND: '0603',
};

export const courseErrorLogLevelMap: Record<
  keyof typeof CourseErrorCode,
  LogLevel
> = {
  COURSE_ASSIGNMENT_NOT_FOUND: LogLevel.INFO,
  COURSE_INVALID_TEACHERS: LogLevel.INFO,
  COURSE_NOT_FOUND: LogLevel.INFO,
  COURSE_UNIT_NOT_FOUND: LogLevel.INFO,
};
