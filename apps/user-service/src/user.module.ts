import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ConfigurationService } from '@app/infrastructure';
import { UserPermission } from './entities/user-permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user/user.entity';
import { Tenant } from './entities/tenant/tenant.entity';
import { Student } from './entities/user/student.entity';
import { Campus } from './entities/tenant/campus.entity';
import { Teacher } from './entities/user/teacher.entity';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtConfig } from '@app/contracts';
import { UserReadService } from './services/user.read.service';
import { UserWriteService } from './services/user.write.service';
import { CoreModule } from '@app/core';

@Module({
  imports: [
    CoreModule.forRoot({
      permissionEntity: UserPermission,
      endpointsProtocol: 'rabbitmq',
      entities: [User, Tenant, Student, Teacher, Campus, UserPermission],
      exchanges: [{ name: 'user-service', type: 'topic' }],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (
        configurationService: ConfigurationService,
      ): JwtModuleOptions => {
        const section = configurationService.getByKey('jwt', JwtConfig);
        return {
          signOptions: { expiresIn: section.expiry },
          secret: section.secret,
        };
      },
      inject: [ConfigurationService],
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
  providers: [UserReadService, UserWriteService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserModule {}
