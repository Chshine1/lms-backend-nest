import { Module } from '@nestjs/common';
import { CourseSchedulingController } from './course-scheduling.controller';
import { CourseSchedulingService } from './course-scheduling.service';
import { CourseSchedule } from './entities/course-schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from '@app/infrastructure';
import { CoreModule } from '@app/core';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [CourseSchedule],
      exchanges: [{ name: 'course-scheduling-service', type: 'topic' }],
    }),
    HealthModule.forRoot({
      database: true,
      rabbitmq: true,
    }),
    TypeOrmModule.forFeature([CourseSchedule]),
  ],
  controllers: [CourseSchedulingController],
  providers: [CourseSchedulingService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseSchedulingModule {}
