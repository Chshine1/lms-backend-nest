import { Module } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { CourseUnit } from './entities/course-unit.entity';
import { Assignment } from './entities/assignment.entity';
import { CourseMaterial } from './entities/course-material.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { InfrastructureModule } from '@app/infrastructure';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypedClient } from '@app/typed-client';

@Module({
  imports: [
    InfrastructureModule.forServiceAsync({
      entities: [Course, CourseUnit, Assignment, CourseMaterial],
      exchanges: [{ name: 'course-service', type: 'topic' }],
      typedClients: [
        {
          client: UserTypedClient,
          options: { exchange: 'user-service' },
        },
      ],
    }),
    TypeOrmModule.forFeature([Course, CourseUnit, Assignment, CourseMaterial]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseModule {}
