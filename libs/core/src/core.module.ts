import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigurationService,
  InfrastructureModule,
} from '@app/infrastructure';
import { DatabaseConfig, RpcResponseInterceptor } from '@app/contracts';
import { ClassConstructor } from 'class-transformer';
import { TypedClientModule } from '@app/typed-client';
import { AuthenticationModule } from '@app/authentication';
import { TraceModule } from '@app/trace';
import { HealthModule } from './health/health.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from '@app/infrastructure';

export interface CoreModuleOptions {
  permissionEntity?: ClassConstructor<object>;
  endpointsProtocol: 'http' | 'rabbitmq';
  exchanges?: { name: string; type: string }[];
  entities: ClassConstructor<object>[];
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CoreModule {
  static forRoot({
    permissionEntity,
    endpointsProtocol,
    exchanges = [],
    entities,
  }: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        InfrastructureModule,
        TraceModule,
        AuthenticationModule.forRoot({
          ...(permissionEntity === undefined ? {} : { permissionEntity }),
          endpointsProtocol,
        }),
        TypedClientModule.forRoot(exchanges),
        TypeOrmModule.forRootAsync({
          imports: [InfrastructureModule],
          useFactory: (configService: ConfigurationService) => {
            const section = configService.getByKey('database', DatabaseConfig);
            return {
              type: 'postgres',
              host: section.host,
              port: section.port,
              username: section.username,
              password: section.password,
              database: section.database,
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
        TraceModule,
        AuthenticationModule,
        TypedClientModule,
        TypeOrmModule,
      ],
    };
  }
}
