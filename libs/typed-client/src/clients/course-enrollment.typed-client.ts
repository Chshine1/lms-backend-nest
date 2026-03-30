import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { EnrollmentContract, CreateEnrollmentDto } from '@app/contracts';
import { CourseEnrollmentPatterns } from '../patterns/course-enrollment.patterns';

@Injectable()
export class CourseEnrollmentTypedClient extends TypedClientBase<CourseEnrollmentPatterns> {
  enrollStudent(data: CreateEnrollmentDto): Promise<EnrollmentContract> {
    return this.rpc('course-enrollment.enroll', data);
  }

  getEnrollmentsByCourse(data: {
    courseId: number;
  }): Promise<EnrollmentContract[]> {
    return this.rpc('course-enrollment.getByCourse', data);
  }

  getEnrollmentsByStudent(data: {
    studentId: number;
  }): Promise<EnrollmentContract[]> {
    return this.rpc('course-enrollment.getByStudent', data);
  }

  getEnrollmentById(data: { id: number }): Promise<EnrollmentContract> {
    return this.rpc('course-enrollment.getById', data);
  }

  unenrollStudent(data: { id: number }): Promise<void> {
    return this.rpc('course-enrollment.unenroll', data);
  }

  unenrollByStudentAndCourse(data: {
    studentId: number;
    courseId: number;
  }): Promise<void> {
    return this.rpc('course-enrollment.unenrollByStudentAndCourse', data);
  }

  getEnrollmentsByStudentWithCourse(data: {
    studentId: number;
  }): Promise<EnrollmentContract[]> {
    return this.rpc(
      'course-enrollment.getEnrollmentsByStudentWithCourse',
      data,
    );
  }

  getEnrollmentByStudentAndCourse(data: {
    studentId: number;
    courseId: number;
  }): Promise<EnrollmentContract | null> {
    return this.rpc('course-enrollment.getByStudentAndCourse', data);
  }
}
