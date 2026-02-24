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
import { ConfigHolder } from '@app/config-lib/config-holder';
import { ConfigSchema } from '@app/config-lib/config-loader.service';

@Module({
  imports: [
    ConfigLibModule.forRoot({
      order: ['env', 'yaml', 'aws'] as const,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigHolder],
      useFactory: (configHolder: ConfigHolder<ConfigSchema>) => {
        return {
          secret: configHolder.config.jwtSecret,
          signOptions: {
            expiresIn: configHolder.config.jwtExpiry,
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
