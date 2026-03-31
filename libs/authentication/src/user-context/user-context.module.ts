import { Module } from '@nestjs/common';
import { UserContextService } from './user-context.service';
import { APP_GUARD } from '@nestjs/core';
import { RabbitMQUserContextGuard } from './user-context.guard';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ClsModule.forRoot({
      middleware: {
        mount: false,
      },
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: RabbitMQUserContextGuard },
    UserContextService,
  ],
  exports: [UserContextService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserContextModule {}
