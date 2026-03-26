import { Module } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { Classroom } from './entities/classroom.entity';
import { CourseMaterial } from './entities/course-material.entity';
import { CourseVideo } from './entities/course-video.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { InfrastructureModule } from '@app/infrastructure';

@Module({
  imports: [
    InfrastructureModule.forRootAsync(),
    InfrastructureModule.forMicroserviceAsync({
      entities: [Course, Classroom, CourseMaterial, CourseVideo],
      exchanges: [{ name: 'course-service', type: 'topic' }],
    }),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseModule {}
