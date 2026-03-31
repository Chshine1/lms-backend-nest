import { DynamicModule, Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Repository } from 'typeorm';
import { PermissionService } from './permission.service';
import { Permission } from './permission.interface';
import { APP_GUARD } from '@nestjs/core';
import { RabbitMQPermissionGuard } from './permission.guards';
import { UserContextModule } from '../user-context/user-context.module';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PermissionModule {
  static forRoot(entity: EntityClassOrSchema): DynamicModule {
    return {
      module: PermissionModule,
      imports: [UserContextModule, TypeOrmModule.forFeature([entity])],
      providers: [
        {
          provide: PermissionService,
          useFactory: (repo: Repository<Permission>): PermissionService =>
            new PermissionService(repo),
          inject: [getRepositoryToken(entity)],
        },
        {
          provide: APP_GUARD,
          useClass: RabbitMQPermissionGuard,
        },
      ],
    };
  }
}
