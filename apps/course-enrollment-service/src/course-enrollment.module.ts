import { Module } from '@nestjs/common';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { CourseEnrollmentService } from './course-enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import { InfrastructureModule } from '@app/infrastructure';
import { UserPermission } from '@/user-service/src/entities/user-permission.entity';

@Module({
  imports: [
    InfrastructureModule.forRootAsync(),
    InfrastructureModule.forMicroserviceAsync({
      entities: [Enrollment],
      permissionEntity: UserPermission,
      exchanges: [{ name: 'course-enrollment-service', type: 'topic' }],
    }),
  ],
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CourseEnrollmentModule {}
