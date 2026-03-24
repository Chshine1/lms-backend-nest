import { Module } from '@nestjs/common';
import { CourseSchedulingController } from './course-scheduling.controller';
import { CourseSchedulingService } from './course-scheduling.service';

@Module({
  imports: [],
  controllers: [CourseSchedulingController],
  providers: [CourseSchedulingService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseSchedulingModule {}
