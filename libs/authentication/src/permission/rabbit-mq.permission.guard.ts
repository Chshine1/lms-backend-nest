import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RmqContext } from '@nestjs/microservices';
import { PermissionService } from './permission.service';
import { PERMISSION_KEY } from './permission.decorator';

@Injectable()
export class RabbitMQPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<
      | {
          resource: number;
          action: number;
        }
      | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredPermission) {
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

    const userPermissions =
      await this.permissionService.getUserPermissions(userId);

    const hasPermission = userPermissions.some(
      (userPerm) =>
        userPerm.resource === requiredPermission.resource &&
        userPerm.action === requiredPermission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return true;
  }
}
