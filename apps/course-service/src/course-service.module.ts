import { Module } from '@nestjs/common';
import { CourseServiceController } from './course-service.controller';
import { CourseServiceService } from './course-service.service';

@Module({
  imports: [],
  controllers: [CourseServiceController],
  providers: [CourseServiceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseServiceModule {}
