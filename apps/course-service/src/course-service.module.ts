import { Module } from '@nestjs/common';
import { CourseServiceService } from './course-service.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CourseServiceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseServiceModule {}
