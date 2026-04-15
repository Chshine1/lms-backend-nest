import { DynamicModule, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { DatabaseConfig, RpcResponseInterceptor } from '@app/contracts';
import { ClassConstructor } from 'class-transformer';
import { TypedClientModule } from '@app/typed-client';
import { AuthenticationModule } from '@app/authentication';
import { HealthModule } from './health/health.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from '@app/infrastructure';

export interface CoreModuleOptions {
  endpointsProtocol: 'http' | 'rabbitmq';
  exchanges?: { name: string; type: string }[];
  entities: ClassConstructor<object>[];
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CoreModule {
  static forRoot({
    endpointsProtocol,
    exchanges = [],
    entities,
  }: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        InfrastructureModule,
        AuthenticationModule.forRoot({
          endpointsProtocol,
        }),
        TypedClientModule.forRoot(exchanges),
        // TODO: There should be a commonly wrapped database module independent of implementations?
        MikroOrmModule.forRootAsync({
          imports: [InfrastructureModule],
          useFactory: (configService: ConfigurationService) => {
            const section = configService.getByKey('database', DatabaseConfig);
            return {
              type: 'postgresql',
              clientUrl: `postgresql://${section.username}:${section.password}@${section.host}:${String(section.port)}/${section.database}`,
              entities,
              synchronize: false,
            };
          },
          inject: [ConfigurationService],
        }),
        HealthModule,
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: RpcResponseInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: GlobalExceptionFilter,
        },
      ],
      exports: [
        InfrastructureModule,
        AuthenticationModule,
        TypedClientModule,
        MikroOrmModule,
      ],
    };
  }
}
