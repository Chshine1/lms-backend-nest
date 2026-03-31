import { CreateUserDto, UserContract, UserLoginDto } from '@app/contracts';

export interface UserPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'user.create': {
    request: CreateUserDto;
    response: UserContract;
  };
  'user.login': {
    request: UserLoginDto;
    response: string;
  };
}
