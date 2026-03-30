import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RmqContext } from '@nestjs/microservices';
import { USER_CONTEXT_KEY } from './user-context.decorator';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RabbitMQUserContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private clsService: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<
      object | undefined
    >(USER_CONTEXT_KEY, [context.getHandler(), context.getClass()]);
    if (requiredPermission === undefined) {
      return true;
    }

    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const message = rmqContext.getMessage() as Record<string, unknown>;
    const props = message['properties'] as Record<string, unknown> | undefined;
    const headers = (props && props['headers']) as
      | Record<string, unknown>
      | undefined;
    const userId = headers?.['x-user-id'] as number | undefined;

    if (!userId) {
      throw new ForbiddenException();
    }

    this.clsService.set('userId', userId);
    return true;
  }
}
