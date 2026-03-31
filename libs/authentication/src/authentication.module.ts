import { DynamicModule, Module } from '@nestjs/common';
import { PermissionModule } from './permission/permission.module';
import { UserContextModule } from './user-context/user-context.module';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export interface AuthenticationModuleOptions {
  permissionEntity?: EntityClassOrSchema;
  endpointsProtocol: 'http' | 'rabbitmq';
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthenticationModule {
  static forRoot({
    permissionEntity,
    endpointsProtocol,
  }: AuthenticationModuleOptions): DynamicModule {
    const permissionModuleImport =
      permissionEntity === undefined
        ? []
        : [PermissionModule.forFeature(permissionEntity)];

    return {
      module: AuthenticationModule,
      imports: [
        UserContextModule.forRoot(endpointsProtocol),
        ...permissionModuleImport,
      ],
      exports: [UserContextModule],
    };
  }
}
