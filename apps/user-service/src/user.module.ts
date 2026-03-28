import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { InfrastructureModule } from '@app/infrastructure';
import { Tenant } from './entities/tenant.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { Parent } from './entities/parent.entity';
import { Admin } from './entities/admin.entity';
import { Campus } from './entities/campus.entity';
import { UserPermission } from './entities/user-permission.entity';

@Module({
  imports: [
    InfrastructureModule.forRootAsync(),
    InfrastructureModule.forServiceAsync({
      entities: [
        User,
        Tenant,
        Student,
        Teacher,
        Parent,
        Admin,
        Campus,
        UserPermission,
      ],
      permissionEntity: UserPermission,
      exchanges: [{ name: 'user-service', type: 'topic' }],
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserModule {}
