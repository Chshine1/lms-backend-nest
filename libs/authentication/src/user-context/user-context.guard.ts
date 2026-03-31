import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RabbitMQUserContextGuard implements CanActivate {
  constructor(private clsService: ClsService) {}

  canActivate(context: ExecutionContext): boolean {
    const rmqContext = context.switchToRpc().getContext<RmqContext>();

    const message = rmqContext.getMessage() as Record<string, unknown>;
    const props = message['properties'] as Record<string, unknown> | undefined;
    const headers = (props && props['headers']) as
      | Record<string, unknown>
      | undefined;

    const userId = headers?.['x-user-id'] as number | undefined;
    this.clsService.set('userId', userId);
    return true;
  }
}
