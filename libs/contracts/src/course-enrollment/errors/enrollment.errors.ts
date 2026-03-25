import { BaseError, ErrorCode } from '../../errors';

export class EnrollmentNotFoundError extends BaseError<{
  enrollmentId: number;
}> {
  constructor(enrollmentId: number) {
    super('Enrollment not found', ErrorCode.ENROLLMENT_NOT_FOUND, {
      enrollmentId,
    });
  }
}

export class StudentNotFoundError extends BaseError<{ studentId: number }> {
  constructor(studentId: number) {
    super('Student not found', ErrorCode.STUDENT_NOT_FOUND, { studentId });
  }
}

export class CourseNotFoundEnrollmentError extends BaseError<{
  courseId: number;
}> {
  constructor(courseId: number) {
    super('Course not found', ErrorCode.COURSE_NOT_FOUND_ENROLLMENT, {
      courseId,
    });
  }
}

export class AlreadyEnrolledError extends BaseError<{
  studentId: number;
  courseId: number;
}> {
  constructor(studentId: number, courseId: number) {
    super(
      'Student already enrolled in this course',
      ErrorCode.ALREADY_ENROLLED,
      {
        studentId,
        courseId,
      },
    );
  }
}

export class NotStudentRoleError extends BaseError<{ userId: number }> {
  constructor(userId: number) {
    super('User does not have student role', ErrorCode.NOT_STUDENT_ROLE, {
      userId,
    });
  }
}
