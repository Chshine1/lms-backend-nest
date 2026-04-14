import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';

@Module({
  imports: [],
  controllers: [AssessmentController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AssessmentModule {}
