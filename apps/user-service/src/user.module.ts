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

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'rabbitmq',
      entities: [],
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
