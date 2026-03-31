import { DynamicModule, Module } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { PermissionModule } from './permission/permission.module';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthenticationModule {
  static forRoot(permissionEntity?: ClassConstructor<unknown>): DynamicModule {
    return {
      module: AuthenticationModule,
      imports: [
        PermissionModule.forFeature(permissionEntity),
      ],
      exports: [PermissionModule],
    };
  }
}
