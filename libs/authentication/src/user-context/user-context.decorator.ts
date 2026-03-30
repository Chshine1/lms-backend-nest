import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const USER_CONTEXT_KEY = 'user-contexts';
export const UserContext = (): CustomDecorator =>
  SetMetadata(USER_CONTEXT_KEY, {});
