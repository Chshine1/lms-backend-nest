import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSchedulingController } from './course-scheduling.controller';
import { CourseSchedulingService } from './course-scheduling.service';
import { CourseSchedule } from './entities/course-schedule.entity';
import { InfrastructureModule } from '@app/infrastructure/infrastructure.module';

@Module({
  imports: [
    InfrastructureModule.forRoot(),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([CourseSchedule]),
  ],
  controllers: [CourseSchedulingController],
  providers: [CourseSchedulingService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseSchedulingModule {}
