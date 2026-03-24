import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';

@Module({
  imports: [],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AssignmentModule {}
