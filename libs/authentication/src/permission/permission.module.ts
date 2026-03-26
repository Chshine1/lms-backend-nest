import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Repository } from 'typeorm';
import { PermissionService } from './permission.service';
import { Permission } from './permission.interface';
import { APP_GUARD } from '@nestjs/core';
import {
  PermissionGuard,
  RabbitMQPermissionGuard,
  type PermissionGuardType,
} from './permission.guards';

export interface PermissionModuleOptions {
  entity: EntityClassOrSchema;
  guardType?: PermissionGuardType;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PermissionModule {
  static forFeature({
    entity,
    guardType = 'http',
  }: PermissionModuleOptions): DynamicModule {
    const repositoryToken = getRepositoryToken(entity);

    const permissionServiceProvider: Provider = {
      provide: PermissionService,
      useFactory: (repo: Repository<Permission>) => new PermissionService(repo),
      inject: [repositoryToken],
    };

    const guardClass =
      guardType === 'rabbitmq' ? RabbitMQPermissionGuard : PermissionGuard;

    const permissionGuardProvider: Provider = {
      provide: APP_GUARD,
      useClass: guardClass,
    };

    return {
      module: PermissionModule,
      imports: [TypeOrmModule.forFeature([entity])],
      providers: [permissionServiceProvider, permissionGuardProvider],
    };
  }
}
