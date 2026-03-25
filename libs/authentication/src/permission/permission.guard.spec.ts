import { PermissionGuard } from './permission.guard';
import { PermissionService } from './permission.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { type Request } from 'express';

describe('PermissionGuard', () => {
  let permissionGuard: PermissionGuard;
  let reflector: jest.Mocked<Reflector>;
  let permissionService: jest.Mocked<PermissionService>;
  let executionContext: jest.Mocked<ExecutionContext>;
  let request: jest.Mocked<Request>;

  function createMockReflector(): jest.Mocked<Reflector> {
    return {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
  }

  function createMockPermissionService(): jest.Mocked<PermissionService> {
    return {
      getUserPermissions: jest.fn(),
    } as unknown as jest.Mocked<PermissionService>;
  }

  function createMockExecutionContext(): jest.Mocked<ExecutionContext> {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;
  }

  function createMockRequest(): jest.Mocked<Request> {
    return {
      user: undefined,
    } as unknown as jest.Mocked<Request>;
  }

  beforeEach(() => {
    reflector = createMockReflector();
    permissionService = createMockPermissionService();
    executionContext = createMockExecutionContext();
    request = createMockRequest();

    (executionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(
      request,
    );

    permissionGuard = new PermissionGuard(reflector, permissionService);
  });

  describe('canActivate', () => {
    describe('when no permission is required', () => {
      it('should return true', async () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        const result = await permissionGuard.canActivate(executionContext);

        expect(result).toBe(true);
        expect(permissionService.getUserPermissions).not.toHaveBeenCalled();
      });
    });

    describe('when user is not authenticated', () => {
      it('should throw ForbiddenException', async () => {
        const requiredPermission = { resource: 1, action: 2 };
        reflector.getAllAndOverride.mockReturnValue(requiredPermission);
        delete request.user;

        await expect(
          permissionGuard.canActivate(executionContext),
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('when user is authenticated', () => {
      beforeEach(() => {
        request.user = ({ id: 123 } as unknown as typeof request.user)!;
      });

      describe('and user has required permission', () => {
        it('should return true', async () => {
          const requiredPermission = { resource: 1, action: 2 };
          const userPermissions = [
            { userId: 123, resource: 1, action: 2, createdAt: new Date() },
          ];

          reflector.getAllAndOverride.mockReturnValue(requiredPermission);
          permissionService.getUserPermissions.mockResolvedValue(
            userPermissions,
          );

          const result = await permissionGuard.canActivate(executionContext);

          expect(result).toBe(true);
          expect(permissionService.getUserPermissions).toHaveBeenCalledWith(
            123,
          );
        });
      });

      describe('and user does not have required permission', () => {
        it('should throw ForbiddenException', async () => {
          const requiredPermission = { resource: 1, action: 2 };
          const userPermissions = [
            { userId: 123, resource: 3, action: 4, createdAt: new Date() },
          ];

          reflector.getAllAndOverride.mockReturnValue(requiredPermission);
          permissionService.getUserPermissions.mockResolvedValue(
            userPermissions,
          );

          await expect(
            permissionGuard.canActivate(executionContext),
          ).rejects.toThrow(ForbiddenException);
        });
      });

      describe('and user has multiple permissions', () => {
        it('should return true if any permission matches', async () => {
          const requiredPermission = { resource: 1, action: 2 };
          const userPermissions = [
            { userId: 123, resource: 3, action: 4, createdAt: new Date() },
            { userId: 123, resource: 1, action: 2, createdAt: new Date() },
            { userId: 123, resource: 5, action: 6, createdAt: new Date() },
          ];

          reflector.getAllAndOverride.mockReturnValue(requiredPermission);
          permissionService.getUserPermissions.mockResolvedValue(
            userPermissions,
          );

          const result = await permissionGuard.canActivate(executionContext);

          expect(result).toBe(true);
        });
      });
    });
  });
});
