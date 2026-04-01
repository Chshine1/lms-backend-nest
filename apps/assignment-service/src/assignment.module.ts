import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { Submission } from './entities/submission.entity';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@app/core';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
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
