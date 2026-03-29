import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import {
  AlreadyEnrolledError,
  EnrollmentNotFoundError,
  CreateEnrollmentDto,
  EnrollmentContract,
  CourseContract,
} from '@app/contracts';
import { plainToInstance } from 'class-transformer';

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

  async getEnrollmentsByCourse(
    courseId: number,
  ): Promise<EnrollmentContract[]> {
    const enrollments = await this.enrollmentRepo.find({ where: { courseId } });
    return plainToInstance(EnrollmentContract, enrollments, {
      excludeExtraneousValues: true,
    });
  }

  async getEnrollmentsByStudent(
    studentId: number,
  ): Promise<EnrollmentContract[]> {
    const enrollments = await this.enrollmentRepo.find({
      where: { studentId },
    });
    return plainToInstance(EnrollmentContract, enrollments, {
      excludeExtraneousValues: true,
    });
  }

  async getEnrollmentsByStudentWithCourse(
    studentId: number,
  ): Promise<EnrollmentContract[]> {
    const enrollments = await this.enrollmentRepo.find({
      where: { studentId },
      relations: ['course'],
    });
    return plainToInstance(EnrollmentContract, enrollments, {
      excludeExtraneousValues: true,
    });
  }

  async getEnrollmentById(id: number): Promise<EnrollmentContract> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment) {
      throw new EnrollmentNotFoundError(id);
    }
    return plainToInstance(EnrollmentContract, enrollment, {
      excludeExtraneousValues: true,
    });
  }

  async getEnrollmentByStudentAndCourse(
    studentId: number,
    courseId: number,
  ): Promise<EnrollmentContract | null> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId, courseId },
    });
    if (!enrollment) return null;
    return plainToInstance(EnrollmentContract, enrollment, {
      excludeExtraneousValues: true,
    });
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
