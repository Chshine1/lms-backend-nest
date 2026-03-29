import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { Submission } from './entities/submission.entity';
import { Review } from './entities/review.entity';
import { InfrastructureModule } from '@app/infrastructure';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    InfrastructureModule.forServiceAsync({
      entities: [Submission, Review],
      exchanges: [{ name: 'assignment-service', type: 'topic' }],
    }),
    TypeOrmModule.forFeature([Submission, Review]),
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AssignmentModule {}
