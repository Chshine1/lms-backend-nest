import { DynamicModule, Module } from '@nestjs/common';
import { PermissionModule } from './permission/permission.module';
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
    return {
      module: AuthenticationModule,
      imports: [
        PermissionModule.forFeature({
          entity: permissionEntity,
          endpointsProtocol,
        }),
      ],
      exports: [PermissionModule],
    };
  }
}
