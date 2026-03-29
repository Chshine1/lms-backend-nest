import { Module } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { CourseUnit } from './entities/course-unit.entity';
import { Assignment } from './entities/assignment.entity';
import { Classroom } from './entities/classroom.entity';
import { CourseMaterial } from './entities/course-material.entity';
import { CourseVideo } from './entities/course-video.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { InfrastructureModule } from '@app/infrastructure';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    InfrastructureModule.forServiceAsync({
      entities: [
        Course,
        CourseUnit,
        Assignment,
        Classroom,
        CourseMaterial,
        CourseVideo,
      ],
      exchanges: [{ name: 'course-service', type: 'topic' }],
    }),
    TypeOrmModule.forFeature([
      Course,
      CourseUnit,
      Assignment,
      Classroom,
      CourseMaterial,
      CourseVideo,
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseModule {}
