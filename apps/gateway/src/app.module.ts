import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtConfig } from '@app/contracts';
import {
  ConfigurationService,
  HealthModule,
  InfrastructureModule,
} from '@app/infrastructure';
import {
  CourseTypedClient,
  TypedClientModule,
  UserTypedClient,
} from '@app/typed-client';
import {
  UserController,
  CourseController,
  CommonController,
} from './controllers/index';
import { CoreModule } from '@app/core';

@Module({
  imports: [
    CoreModule.forRoot({
      endpointsProtocol: 'http',
      entities: [],
      exchanges: [
        {
          name: 'user-service',
          type: 'topic',
        },
      ],
    }),
    HealthModule.forRoot({
      database: false,
      rabbitmq: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [InfrastructureModule],
      useFactory: (configService: ConfigurationService) => {
        const jwtSection = configService.getByKey('jwt', JwtConfig);
        return {
          secret: jwtSection.secret,
          signOptions: {
            expiresIn: jwtSection.expiry,
          },
        };
      },
      inject: [ConfigurationService],
    }),
    TypedClientModule.forFeature([
      {
        mqOptions: {
          exchange: 'user-service',
        },
        client: UserTypedClient,
      },
      {
        mqOptions: {
          exchange: 'course-service',
        },
        client: CourseTypedClient,
      },
    ]),
  ],
  controllers: [CommonController, UserController, CourseController],
  providers: [AppService, JwtStrategy],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
