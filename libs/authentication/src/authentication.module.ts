import { DynamicModule, Module } from '@nestjs/common';
import { PermissionModule } from './permission/permission.module';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { UserContextModule } from './user-context/user-context.module';

export interface AuthenticationModuleOptions {
  permissionEntity?: EntityClassOrSchema;
  endpointsProtocol: 'http' | 'rabbitmq';
}

@Module({
  imports: [UserContextModule],
  exports: [UserContextModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthenticationModule {
  static forRoot({
    permissionEntity,
    endpointsProtocol,
  }: AuthenticationModuleOptions): DynamicModule {
    return {
      module: AuthenticationModule,
      imports: [
        UserContextModule.forRoot(endpointsProtocol),
        ...(permissionEntity === undefined
          ? []
          : [PermissionModule.forRoot(permissionEntity)]),
      ],
      exports: permissionEntity === undefined ? [] : [PermissionModule],
    };
  }
}
