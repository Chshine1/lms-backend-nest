import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AlreadyEnrolledError, EnrollmentNotFoundError } from '@app/contracts';

@Injectable()
export class CourseEnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async enrollStudent(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<Enrollment> {
    const { studentId, courseId } = createEnrollmentDto;

    const existingEnrollment = await this.enrollmentRepo.findOne({
      where: { studentId, courseId },
      withDeleted: true,
    });

    if (existingEnrollment && !existingEnrollment.deletedAt) {
      throw new AlreadyEnrolledError(studentId, courseId);
    }

    const enrollment = this.enrollmentRepo.create({
      studentId,
      courseId,
      enrolledAt: new Date(),
    });

    return this.enrollmentRepo.save(enrollment);
  }

  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    return this.enrollmentRepo.find({ where: { courseId } });
  }

  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return this.enrollmentRepo.find({ where: { studentId } });
  }

  async getEnrollmentById(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment) {
      throw new EnrollmentNotFoundError(id);
    }
    return enrollment;
  }

  async unenrollStudent(id: number): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment) {
      throw new EnrollmentNotFoundError(id);
    }
    await this.enrollmentRepo.softDelete(id);
  }

  async unenrollByStudentAndCourse(
    studentId: number,
    courseId: number,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId, courseId },
    });
    if (!enrollment) {
      throw new EnrollmentNotFoundError(0);
    }
    await this.enrollmentRepo.softDelete(enrollment.id);
  }
}
