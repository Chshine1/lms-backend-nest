import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { UserClientModule } from './user-client/user-client.module';
import { TenantClientModule } from './tenant-client/tenant-client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
    UserClientModule,
    TenantClientModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
