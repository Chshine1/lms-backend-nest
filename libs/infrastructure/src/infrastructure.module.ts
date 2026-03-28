import { DynamicModule, Global, Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassConstructor, Expose } from 'class-transformer';
import { IsDefined, IsString, IsNumber } from 'class-validator';

import { type TypedClientBase } from '@app/typed-client';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { LoggerModule } from './modules/logger/logger.module';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { InfrastructureService } from './infrastructure.service';
import { TypedClientModule, TypedClientMqOptions } from '@app/typed-client';
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
  typedClients?: {
    client: ClassConstructor<TypedClientBase>;
    options: TypedClientMqOptions;
  }[];
}

@Module({})
@Global()
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InfrastructureModule {
  static forRootAsync(): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [ConfigurationModule, LoggerModule],
      providers: [
        // TODO: prevent the inner loaders from being exported
        InfrastructureService,
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({ transform: true }),
        },
      ],
      exports: [ConfigurationModule, LoggerModule],
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
