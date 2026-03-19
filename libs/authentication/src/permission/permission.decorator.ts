import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';
export const RequirePermissions = (
  resource: number,
  action: number,
): CustomDecorator =>
  SetMetadata(PERMISSION_KEY, {
    resource,
    action,
  });
