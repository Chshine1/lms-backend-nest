import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { TypedClientModule, UserTypedClient } from '@app/typed-client';
import { CoreModule } from '@app/core';
import { EnrollmentDomainService } from './domain/services/enrollment.service';
import { CourseApplicationService } from './application/services/course.application-service';
import { EnrollmentApplicationService } from './application/services/enrollment.application-service';
import { EventBusModule } from '@app/event-bus';
import { Course } from './domain/entities/course.entity';
import { Enrollment } from './domain/entities/enrollment.entity';
import {
  CourseRepository,
  EnrollmentRepository,
} from './infrastructure/repositories/index';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [Course, Enrollment],
      exchanges: [
        { name: 'course-service', type: 'topic' },
        { name: 'user-service', type: 'topic' },
      ],
    }),
    TypedClientModule.forFeature([
      {
        mqOptions: {
          exchange: 'user-service',
        },
        client: UserTypedClient,
      },
    ]),
    EventBusModule.forRoot(),
  ],
  controllers: [CourseController],
  providers: [
    EnrollmentDomainService,
    CourseApplicationService,
    EnrollmentApplicationService,
    CourseRepository,
    EnrollmentRepository,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseModule {}
