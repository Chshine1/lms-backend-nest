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
import { ConfigurationContainer } from '@app/config-lib/configuration-container';
import {
  globalConfigLoaderPipeline,
  GlobalConfigSchema,
} from '@app/contracts/config-loader-pipeline.global';

@Module({
  imports: [
    ConfigLibModule.forRoot({
      loadersPipeline: globalConfigLoaderPipeline,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigurationContainer],
      useFactory: (
        configContainer: ConfigurationContainer<GlobalConfigSchema>,
      ) => {
        const jwtSection = configContainer.config.jwt;
        return {
          secret: jwtSection.secret,
          signOptions: {
            expiresIn: jwtSection.expiry,
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
