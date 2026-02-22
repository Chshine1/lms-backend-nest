import {
  SharedCreateUserDto,
  SharedUser,
  SharedValidateUserDto,
} from '../../../common';

export interface UserServicePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'user.create': {
    request: SharedCreateUserDto;
    response: SharedUser;
  };
  'user.validate': {
    request: SharedValidateUserDto;
    response: SharedUser | null;
  };
  'user.findById': {
    request: { id: number };
    response: SharedUser | null;
  };
  'user.findByTenant': {
    request: { tenantId: number };
    response: SharedUser[];
  };
}
