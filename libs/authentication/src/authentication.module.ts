import { DynamicModule, Module } from '@nestjs/common';
import { UserContextModule } from './user-context/user-context.module';

interface AuthenticationModuleOptions {
  endpointsProtocol: 'http' | 'rabbitmq';
}

@Module({
  imports: [UserContextModule],
  exports: [UserContextModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthenticationModule {
  static forRoot({
    endpointsProtocol,
  }: AuthenticationModuleOptions): DynamicModule {
    return {
      module: AuthenticationModule,
      imports: [UserContextModule.forRoot(endpointsProtocol)],
      exports: [],
    };
  }
}
