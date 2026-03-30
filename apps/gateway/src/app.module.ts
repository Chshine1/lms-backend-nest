import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtConfig } from '@app/contracts';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { TypedClientModule, UserTypedClient } from '@app/typed-client';

@Module({
  imports: [
    InfrastructureModule.forServiceAsync({
      entities: [],
      exchanges: [
        {
          name: 'user-service',
          type: 'topic',
        },
      ],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => {
        const jwtSection = configService.getByKey('jwt', JwtConfig);
        return {
          secret: jwtSection.secret,
          signOptions: {
            expiresIn: jwtSection.expiry,
          },
        };
      },
    }),
    TypedClientModule.forFeature([
      {
        mqOptions: {
          exchange: 'user-service',
        },
        client: UserTypedClient,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
