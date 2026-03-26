import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Repository } from 'typeorm';
import { PermissionService } from './permission.service';
import { Permission } from './permission.interface';
import { APP_GUARD } from '@nestjs/core';
import { RabbitMQPermissionGuard } from './rabbit-mq.permission.guard';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RabbitMQPermissionModule {
  static forFeature(entity: EntityClassOrSchema): DynamicModule {
    const repositoryToken = getRepositoryToken(entity);

    const permissionServiceProvider: Provider = {
      provide: PermissionService,
      useFactory: (repo: Repository<Permission>) => new PermissionService(repo),
      inject: [repositoryToken],
    };

    const rabbitMQPermissionGuardProvider: Provider = {
      provide: APP_GUARD,
      useClass: RabbitMQPermissionGuard,
    };

    return {
      module: RabbitMQPermissionModule,
      imports: [TypeOrmModule.forFeature([entity])],
      providers: [permissionServiceProvider, rabbitMQPermissionGuardProvider],
    };
  }
}
