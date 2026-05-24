import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { CourseTypedClient, TypedClientModule } from '@app/typed-client';
import { CoreModule } from '@app/core';
import { SubmissionApplicationService } from './application/services/submission.application-service';
import { AssignmentApplicationService } from './application/services/assignment.application-service';
import { ReviewApplicationService } from './application/services/review.application-service';
import { FileApplicationService } from './application/services/file.application-service';
import { Assignment } from './domain/entities/assignment.entity';
import { Submission } from './domain/entities/submission.entity';
import { Review } from './domain/entities/review.entity';
import { AssignmentFile } from './domain/entities/assignment-file.entity';
import { SubmissionFile } from './domain/entities/submission-file.entity';
import { EventBusModule } from '@app/event-bus';
import {
  AssignmentRepository,
  SubmissionRepository,
  ReviewRepository,
  SubmissionFileRepository,
  AssignmentFileRepository,
} from './infrastructure/repositories/index';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [
        Assignment,
        Submission,
        Review,
        AssignmentFile,
        SubmissionFile,
      ],
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
    EventBusModule.forRoot(),
  ],
  controllers: [AssessmentController],
  providers: [
    SubmissionApplicationService,
    ReviewApplicationService,
    FileApplicationService,
    AssignmentApplicationService,
    AssignmentRepository,
    SubmissionRepository,
    ReviewRepository,
    SubmissionFileRepository,
    AssignmentFileRepository,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AssessmentModule {}
