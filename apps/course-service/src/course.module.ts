import { Module } from '@nestjs/common';
import { Course } from './entities/index';
import { CourseUnit } from './entities/index';
import { Assignment } from './entities/index';
import { CourseMaterial } from './entities/index';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReadService, CourseWriteService } from './services/index';
import { TypedClientModule, UserTypedClient } from '@app/typed-client';
import { CoreModule } from '@app/core';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [Course, CourseUnit, Assignment, CourseMaterial],
      exchanges: [{ name: 'user-service', type: 'topic' }],
    }),
    TypedClientModule.forFeature([
      {
        mqOptions: {
          exchange: 'user-service',
        },
        client: UserTypedClient,
      },
    ]),
    TypeOrmModule.forFeature([Course, CourseUnit, Assignment, CourseMaterial]),
  ],
  controllers: [CourseController],
  providers: [CourseReadService, CourseWriteService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseModule {}
