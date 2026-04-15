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
import { RegistrationService } from './domain/services/registration.service';
import { AuthorizationService } from './domain/services/authorization.service';
import { ParentStudentLinkingService } from './domain/services/parent-student-linking.service';
import { UserApplicationService } from './application/services/user.application-service';
import { OnboardingApplicationService } from './application/services/onboarding.application-service';
import { RoleApplicationService } from './application/services/role.application-service';
import { LinkingApplicationService } from './application/services/linking.application-service';
import {
  UserRepository,
  TenantRepository,
  RoleRepository,
  StudentProfileRepository,
  ParentStudentLinkRepository,
  UserRoleAssignmentRepository,
} from './infrastructure/repositories/index';
import { PasswordHashService } from '@/user-service/src/infrastructure/services/password-hash.service';

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
  providers: [
    UserRepository,
    TenantRepository,
    RoleRepository,
    StudentProfileRepository,
    ParentStudentLinkRepository,
    UserRoleAssignmentRepository,
    PasswordHashService,
    RegistrationService,
    AuthorizationService,
    ParentStudentLinkingService,
    UserApplicationService,
    OnboardingApplicationService,
    RoleApplicationService,
    LinkingApplicationService,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserModule {}
