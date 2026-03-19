import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { PERMISSIONS_KEY } from '@app/authentication/decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      string[] | undefined
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException();
    }

    const userPermissions = new Set<string>(user.permissions);

    const hasPermission = requiredPermissions.every((perm) =>
      Array.from(userPermissions).some(
        (userPerm) => userPerm === perm || userPerm === '*',
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return true;
  }
}
