import {
  CreateUserDto,
  UserContract,
  ValidateUserDto,
  TenantContract,
} from '@app/contracts';

export interface UserPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'user.create': {
    request: CreateUserDto;
    response: UserContract;
  };
  'user.validate': {
    request: ValidateUserDto;
    response: UserContract | null;
  };
  'user.findById': {
    request: { id: number };
    response: UserContract | null;
  };
  'tenant.findById': {
    request: number;
    response: TenantContract | null;
  };
  'tenant.validate': {
    request: number;
    response: TenantContract | null;
  };
}
