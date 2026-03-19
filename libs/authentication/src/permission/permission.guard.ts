import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { PermissionService } from '@app/authentication/permission/permission.service';
import { PERMISSION_KEY } from '@app/authentication/permission/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException();
    }

    const userPermissions = await this.permissionService.getUserPermissions(
      user.id,
    );

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
