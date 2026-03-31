import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RabbitMQUserContextInterceptor } from './user-context.guard';
import { ClsModule } from 'nestjs-cls';
import { UserContextService } from './user-context.service';

@Module({
  providers: [UserContextService],
  exports: [UserContextService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserContextModule {
  static forRoot(endpointsProtocol: 'http' | 'rabbitmq'): DynamicModule {
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
            endpointsProtocol === 'http'
              ? RabbitMQUserContextInterceptor
              : RabbitMQUserContextInterceptor,
        },
      ],
    };
  }
}
