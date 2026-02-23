import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { UserClientModule } from './user-client/user-client.module';
import { TenantClientModule } from './tenant-client/tenant-client.module';
import { TenantTypedClient } from '@app/typed-client/tenant.typed-client';
import { ConfigLibModule } from '@app/config-lib/config-lib.module';
import { Config } from '@app/config-lib/interfaces/raw-config.interface';
import {
  getNumber,
  getRequiredString,
} from '@app/config-lib/utils/extract.utils';

@Module({
  imports: [
    ConfigLibModule.forRoot({
      order: ['env', 'yaml', 'aws'],
      initial: {
        environment: process.env['NODE_ENV'] || 'production',
        serviceName: 'gateway',
      },
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      inject: ['CONFIG'],
      useFactory: (config: Config) => {
        return {
          secret: getRequiredString(config, 'jwtSecret'),
          signOptions: {
            expiresIn: getNumber(config, 'jwtExpiresIn') || '1d',
          },
        };
      },
    }),
    UserClientModule,
    TenantClientModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, TenantTypedClient],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
