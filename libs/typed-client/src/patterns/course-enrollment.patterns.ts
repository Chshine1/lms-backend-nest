import { EnrollmentContract } from '@app/contracts/course-enrollment/entities/enrollment.contract';
import { CreateEnrollmentDto } from '@/course-enrollment-service/src/dto/create-enrollment.dto';

export interface CourseEnrollmentPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'course-enrollment.enroll': {
    request: CreateEnrollmentDto;
    response: EnrollmentContract;
  };
  'course-enrollment.getByCourse': {
    request: { courseId: number };
    response: EnrollmentContract[];
  };
  'course-enrollment.getByStudent': {
    request: { studentId: number };
    response: EnrollmentContract[];
  };
  'course-enrollment.getById': {
    request: { id: number };
    response: EnrollmentContract;
  };
  'course-enrollment.unenroll': {
    request: { id: number };
    response: void;
  };
  'course-enrollment.unenrollByStudentAndCourse': {
    request: { studentId: number; courseId: number };
    response: void;
  };
}
