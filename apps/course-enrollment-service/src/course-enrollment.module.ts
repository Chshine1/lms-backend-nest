import { Module } from '@nestjs/common';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { CourseEnrollmentService } from './course-enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from '@app/infrastructure';
import { CoreModule } from '@app/core';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [Enrollment],
      exchanges: [{ name: 'course-enrollment-service', type: 'topic' }],
    }),
    HealthModule.forRoot({
      database: true,
      rabbitmq: true,
    }),
    TypeOrmModule.forFeature([Enrollment]),
  ],
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseEnrollmentModule {}
