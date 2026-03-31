import { DynamicModule, Module } from '@nestjs/common';
import { UserContextService } from './user-context.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RabbitMQUserContextInterceptor } from './user-context.guard';
import { ClsModule } from 'nestjs-cls';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserContextModule {
  /**
   * Register an interceptor to extract user information.
   * @param endpointProtocol - The protocol of endpoints is this interceptor applied to.
   * @return Registers an interceptor to extract user information.
   * Exports a UserContextService to get user information.
   */
  static forRoot(endpointProtocol: 'http' | 'rabbitmq'): DynamicModule {
    return {
      module: UserContextModule,
      imports: [
        ClsModule.forRoot({
          middleware: {
            mount: false,
          },
        }),
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass:
            endpointProtocol === 'http'
              ? RabbitMQUserContextInterceptor
              : RabbitMQUserContextInterceptor,
        },
        UserContextService,
      ],
      exports: [UserContextService],
    };
  }
}
