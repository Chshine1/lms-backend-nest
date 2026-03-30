import { DynamicModule, Module, Provider } from '@nestjs/common';
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
  static forFeature(entity?: EntityClassOrSchema): DynamicModule {
    const typeormImports: DynamicModule[] = [];
    const permissionProviders: Provider[] = [];
    if (entity !== undefined) {
      typeormImports.push(TypeOrmModule.forFeature([entity]));

      permissionProviders.push({
        provide: PermissionService,
        useFactory: (repo: Repository<Permission>) =>
          new PermissionService(repo),
        inject: [getRepositoryToken(entity)],
      });
      permissionProviders.push({
        provide: APP_GUARD,
        useClass: RabbitMQPermissionGuard,
      });
    }

    return {
      module: PermissionModule,
      imports: [UserContextModule, ...typeormImports],
      providers: [...permissionProviders],
      exports: [UserContextModule],
    };
  }
}
