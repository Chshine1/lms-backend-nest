import { DynamicModule, Global, Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ClassConstructor, Expose } from 'class-transformer';
import { IsDefined, IsString, IsNumber } from 'class-validator';

import { type TypedClientBase } from '@app/typed-client';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { LoggerService } from './modules/logger/logger.service';
import { InfrastructureService } from './infrastructure.service';
import { TypedClientModule, TypedClientMqOptions } from '@app/typed-client';
import { TraceModule } from '@app/trace';
import { PermissionModule } from '@app/authentication';
import { APP_PIPE } from '@nestjs/core';

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
  typedClientMqOptions?: TypedClientMqOptions;
  typedClients?: ClassConstructor<TypedClientBase>[];
}

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRootAsync(): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [ConfigurationModule, LoggerModule],
      providers: [InfrastructureService, {
        provide: APP_PIPE,
        useValue: new ValidationPipe({ transform: true }),
      }],
      exports: [ConfigurationService, LoggerService],
    };
  }

  static forMicroserviceAsync({
    entities,
    permissionEntity,
    exchanges = [],
    typedClientMqOptions,
    typedClients = [],
  }: MicroserviceInfrastructureOptions): DynamicModule {
    const rabbitMQImports: DynamicModule[] = [];
    const typedClientImports: DynamicModule[] = [];

    if (exchanges.length > 0) {
      rabbitMQImports.push(
        RabbitMQModule.forRootAsync({
          useFactory: (configService: ConfigurationService) => {
            const section = configService.getByKey('rabbitmq', RabbitMQConfig);
            return {
              exchanges: exchanges.map((exchange) => ({
                name: exchange.name,
                type: exchange.type,
              })),
              uri: `amqp://${section.username}:${section.password}@${section.host}:${section.port.toString()}`,
              connectionInitOptions: { wait: true },
            };
          },
          inject: [ConfigurationService],
        }),
      );
    }

    if (typedClients.length > 0 && typedClientMqOptions) {
      typedClientImports.push(
        TypedClientModule.forFeature({
          mqOptions: typedClientMqOptions,
          clients: typedClients,
        }),
      );
    }

    const permissionImports: DynamicModule[] = permissionEntity
      ? [PermissionModule.forFeature(permissionEntity)]
      : [];

    return {
      module: InfrastructureModule,
      imports: [
        ...rabbitMQImports,
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
        TraceModule,
        ...typedClientImports,
        ...permissionImports,
      ],
      exports: [
        TypeOrmModule,
        RabbitMQModule,
        TraceModule,
        ...typedClients,
      ],
    };
  }
}
