import { Module } from '@nestjs/common';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { CourseEnrollmentService } from './course-enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import { InfrastructureModule } from '@app/infrastructure';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    InfrastructureModule.forServiceAsync({
      entities: [Enrollment],
      exchanges: [{ name: 'course-enrollment-service', type: 'topic' }],
    }),
    TypeOrmModule.forFeature([Enrollment]),
  ],
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseEnrollmentModule {}
