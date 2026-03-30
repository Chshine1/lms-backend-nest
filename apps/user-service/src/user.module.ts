import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TenantService } from './tenant.service';
import { InfrastructureModule } from '@app/infrastructure';
import { Tenant } from './entities/tenant.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { Parent } from './entities/parent.entity';
import { Campus } from './entities/campus.entity';
import { UserPermission } from './entities/user-permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    InfrastructureModule.forServiceAsync({
      entities: [
        User,
        Tenant,
        Student,
        Teacher,
        Parent,
        Campus,
        UserPermission,
      ],
      permissionEntity: UserPermission,
      exchanges: [{ name: 'user-service', type: 'topic' }],
    }),
    TypeOrmModule.forFeature([
      User,
      Tenant,
      Student,
      Teacher,
      Parent,
      Campus,
      UserPermission,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, TenantService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserModule {}
