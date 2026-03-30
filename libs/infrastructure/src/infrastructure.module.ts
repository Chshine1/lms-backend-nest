import {
  DynamicModule,
  Global,
  INestApplicationContext,
  Module,
} from '@nestjs/common';
import { APP_INTERCEPTOR, NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassConstructor } from 'class-transformer';

import { TypedClientModule } from '@app/typed-client';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { LoggerService } from './modules/logger/logger.service';
import { RabbitMqTraceInterceptor, TraceService } from '@app/trace';
import { DatabaseConfig } from '@app/contracts';
import { AuthenticationModule } from '@app/authentication';

const GLOBAL_INFRASTRUCTURE_KEY = 'infrastructure';

export async function initializeInfrastructure(): Promise<void> {
  const context: INestApplicationContext =
    await NestFactory.createApplicationContext(LoggerModule);

  try {
    (global as unknown as Record<string, unknown>)[GLOBAL_INFRASTRUCTURE_KEY] =
      {
        configurationService: context.get(ConfigurationService),
        traceService: context.get(TraceService),
        loggerService: context.get(LoggerService),
      };
  } finally {
    await context.close();
  }
}

export interface MicroserviceInfrastructureOptions {
  entities: ClassConstructor<object>[];
  permissionEntity?: ClassConstructor<object>;
  exchanges?: { name: string; type: string }[];
}

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forServiceAsync({
    entities,
    permissionEntity,
    exchanges = [],
  }: MicroserviceInfrastructureOptions): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [
        LoggerModule,
        TypeOrmModule.forRootAsync({
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
        TypedClientModule.forRoot(exchanges),
        AuthenticationModule.forRoot(permissionEntity),
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: RabbitMqTraceInterceptor,
        },
      ],
      exports: [
        LoggerModule,
        TypeOrmModule,
        AuthenticationModule,
        TypedClientModule,
      ],
    };
  }
}
