import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { TypedClientModule, CourseTypedClient } from '@app/typed-client';
import { CoreModule } from '@app/core';
import { SubmissionApplicationService } from './application/services/submission.application-service';
import { ReviewApplicationService } from './application/services/review.application-service';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [],
      exchanges: [
        { name: 'assessment-service', type: 'topic' },
        { name: 'course-service', type: 'topic' },
      ],
    }),
    TypedClientModule.forFeature([
      {
        mqOptions: {
          exchange: 'course-service',
        },
        client: CourseTypedClient,
      },
    ]),
  ],
  controllers: [AssessmentController],
  providers: [SubmissionApplicationService, ReviewApplicationService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AssessmentModule {}
