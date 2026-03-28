import {
  DynamicModule,
  Global,
  INestApplicationContext,
  Module,
} from '@nestjs/common';
import { APP_INTERCEPTOR, NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassConstructor, Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';

import {
  type TypedClientBase,
  TypedClientModule,
  TypedClientMqOptions,
} from '@app/typed-client';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { PermissionModule } from '@app/authentication';
import { LoggerService } from './modules/logger/logger.service';
import { RabbitMqTraceInterceptor, TraceService } from '@app/trace';

export class DatabaseConfig {
  @IsString()
  @IsDefined()
  @Expose()
  host!: string;

  @IsNumber()
  @IsDefined()
  @Expose()
  port!: number;

  @IsString()
  @IsDefined()
  @Expose()
  username!: string;

  @IsString()
  @IsDefined()
  @Expose()
  password!: string;

  @IsString()
  @IsDefined()
  @Expose()
  database!: string;
}

export class RabbitMQConfig {
  @IsString()
  @IsDefined()
  @Expose()
  host!: string;

  @IsNumber()
  @IsDefined()
  @Expose()
  port!: number;

  @IsString()
  @IsDefined()
  @Expose()
  username!: string;

  @IsString()
  @IsDefined()
  @Expose()
  password!: string;
}

export interface MicroserviceInfrastructureOptions {
  entities: ClassConstructor<object>[];
  permissionEntity?: ClassConstructor<object>;
  exchanges?: { name: string; type: string }[];
  typedClients?: {
    client: ClassConstructor<TypedClientBase>;
    options: TypedClientMqOptions;
  }[];
}

interface InfrastructureServices {
  configurationService: ConfigurationService;
  traceService: TraceService;
  loggerService: LoggerService;
}

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

function getGlobalInfrastructure(): InfrastructureServices {
  return (global as unknown as Record<string, unknown>)[
    GLOBAL_INFRASTRUCTURE_KEY
  ] as InfrastructureServices;
}

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRootAsync(): DynamicModule {
    const preloaded = getGlobalInfrastructure();

    return {
      module: InfrastructureModule,
      imports: [],
      providers: [
        {
          provide: ConfigurationService,
          useValue: preloaded.configurationService,
        },
        {
          provide: TraceService,
          useValue: preloaded.traceService,
        },
        {
          provide: LoggerService,
          useValue: preloaded.loggerService,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: RabbitMqTraceInterceptor,
        },
      ],
      exports: [ConfigurationService, TraceService, LoggerService],
    };
  }

  static forServiceAsync({
    entities,
    permissionEntity,
    exchanges = [],
  }: MicroserviceInfrastructureOptions): DynamicModule {
    const permissionImports: DynamicModule[] = permissionEntity
      ? [
          PermissionModule.forFeature({
            entity: permissionEntity,
            guardType: 'rabbitmq',
          }),
        ]
      : [];

    return {
      module: InfrastructureModule,
      imports: [
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
        ...permissionImports,
      ],
      exports: [TypeOrmModule, TypedClientModule],
    };
  }
}
