import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { PermissionService } from './permission.service';
import { PERMISSION_KEY } from './permission.decorator';
import { UserContextService } from '../user-context/user-context.service';

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

@Injectable()
export class RabbitMQPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
    private readonly userContextService: UserContextService,
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

    const userId = this.userContextService.getUserId();

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

export type PermissionGuardType = 'http' | 'rabbitmq';
