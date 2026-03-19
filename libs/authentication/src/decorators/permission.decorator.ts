import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]): CustomDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
