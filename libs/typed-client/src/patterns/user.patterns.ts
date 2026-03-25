import { CreateUserDto, UserContract, ValidateUserDto } from '@app/contracts';

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
}
