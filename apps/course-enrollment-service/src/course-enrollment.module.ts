import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { CourseEnrollmentService } from './course-enrollment.service';
import { Enrollment } from './entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment])],
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseEnrollmentModule {}
