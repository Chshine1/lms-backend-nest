import { Enrollment } from '../entities/enrollment.entity';

export interface IEnrollmentRepository {
  save(enrollment: Enrollment): Promise<void>;
  findByStudentAndCourse(
    studentId: bigint,
    courseId: bigint,
  ): Promise<Enrollment | null>;
  findActiveByStudent(studentId: bigint): Promise<Enrollment[]>;
}
