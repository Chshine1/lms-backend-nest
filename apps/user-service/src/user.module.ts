import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TenantService } from './tenant.service';
import { InfrastructureModule } from '@app/infrastructure';
import { Teacher } from './entities/teacher.entity';
import { UserPermission } from './entities/user-permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user-service/src/entities/user/user.entity';
import { Tenant } from '@/user-service/src/entities/tenant/tenant.entity';
import { Student } from '@/user-service/src/entities/user/student.entity';
import { Campus } from '@/user-service/src/entities/tenant/campus.entity';

@Module({
  imports: [
    InfrastructureModule.forServiceAsync({
      entities: [User, Tenant, Student, Teacher, Campus, UserPermission],
      permissionEntity: UserPermission,
      exchanges: [{ name: 'user-service', type: 'topic' }],
    }),
    TypeOrmModule.forFeature([
      User,
      Tenant,
      Student,
      Teacher,
      Campus,
      UserPermission,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, TenantService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserModule {}
