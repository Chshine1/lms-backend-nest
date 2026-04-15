import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtConfig } from '@app/contracts';
import { CoreModule } from '@app/core';
import { EventBusModule } from '@app/event-bus';
import { User } from './domain/entities/user.entity';
import { Tenant } from './domain/entities/tenant.entity';
import { Role } from './domain/entities/role.entity';
import { StudentProfile } from './domain/entities/student-profile.entity';
import { ParentStudentLink } from './domain/entities/parent-student-link.entity';
import { UserRoleLink } from './domain/entities/user-role-link.entity';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [
        User,
        Tenant,
        Role,
        StudentProfile,
        ParentStudentLink,
        UserRoleLink,
      ],
      exchanges: [{ name: 'user-service', type: 'topic' }],
    }),
    JwtModule.registerAsync({
      imports: [InfrastructureModule],
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
    EventBusModule.forRoot(),
  ],
  controllers: [UserController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserModule {}
