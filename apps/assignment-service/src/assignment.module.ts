import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { Submission } from './entities/submission.entity';
import { Review } from './entities/review.entity';
import { InfrastructureModule } from '@app/infrastructure';

@Module({
  imports: [
    InfrastructureModule.forRootAsync(),
    InfrastructureModule.forServiceAsync({
      entities: [Submission, Review],
      exchanges: [{ name: 'assignment-service', type: 'topic' }],
    }),
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AssignmentModule {}
