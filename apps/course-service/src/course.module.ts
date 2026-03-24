import { Module } from '@nestjs/common';
import { CourseService } from './course.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CourseService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseModule {}
