import { Module } from '@nestjs/common';
import { CourseSchedulingServiceController } from './course-scheduling-service.controller';
import { CourseSchedulingServiceService } from './course-scheduling-service.service';

@Module({
  imports: [],
  controllers: [CourseSchedulingServiceController],
  providers: [CourseSchedulingServiceService],
})
export class CourseSchedulingServiceModule {}
