import { Module } from '@nestjs/common';
import { CourseSchedulingController } from './course-scheduling.controller';
import { CourseSchedulingService } from './course-scheduling.service';
import { CourseSchedule } from './entities/course-schedule.entity';
import { InfrastructureModule } from '@app/infrastructure';
import { UserPermission } from '@/user-service/src/entities/user-permission.entity';

@Module({
  imports: [
    InfrastructureModule.forRootAsync(),
    InfrastructureModule.forMicroserviceAsync({
      entities: [CourseSchedule],
      permissionEntity: UserPermission,
      exchanges: [{ name: 'course-scheduling-service', type: 'topic' }],
    }),
  ],
  controllers: [CourseSchedulingController],
  providers: [CourseSchedulingService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseSchedulingModule {}
