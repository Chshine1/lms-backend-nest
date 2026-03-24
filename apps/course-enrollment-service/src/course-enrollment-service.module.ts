import { Module } from '@nestjs/common';
import { CourseEnrollmentServiceController } from './course-enrollment-service.controller';
import { CourseEnrollmentServiceService } from './course-enrollment-service.service';

@Module({
  imports: [],
  controllers: [CourseEnrollmentServiceController],
  providers: [CourseEnrollmentServiceService],
})
export class CourseEnrollmentServiceModule {}
