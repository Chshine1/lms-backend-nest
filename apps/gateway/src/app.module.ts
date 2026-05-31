import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtConfig } from '@app/contracts';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import {
  AiTypedClient,
  AssessmentTypedClient,
  ChatAttachmentTypedClient,
  ChatTypedClient,
  CourseTypedClient,
  TypedClientModule,
  UserTypedClient,
} from '@app/typed-client';
import {
  UserController,
  CourseController,
  CommonController,
  AssessmentController,
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
        {
          name: 'course-service',
          type: 'topic',
        },
        {
          name: 'assessment-service',
          type: 'topic',
        },
        {
          name: 'ai-service',
          type: 'topic'
        },
        {
          name: 'chatAttachment-service',
          type: 'topic'
        },        
        {
          name: 'chat-service',
          type: 'topic'
        },
      ],
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
      {
        mqOptions: {
          exchange: 'assessment-service',
        },
        client: AssessmentTypedClient,
      },

      {
        mqOptions: {
          exchange: 'ai-service',
        },
        client: AiTypedClient,
      },
      {
        mqOptions: {
          exchange: 'chat-service',
        },
        client: ChatTypedClient,
      },
      {
        mqOptions: {
          exchange: 'chatAttachment-service',
        },
        client: ChatAttachmentTypedClient,
      },
    ]),
  ],
  controllers: [
    CommonController,
    UserController,
    CourseController,
    AssessmentController,
  ],
  providers: [AppService, JwtStrategy],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
