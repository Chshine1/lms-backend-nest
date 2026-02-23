import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';
import { ValidateUserDto } from '@app/contracts/user/dto/validate-user.dto';

export interface UserServicePatterns extends Record<
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
  'user.findByTenant': {
    request: { tenantId: number };
    response: UserContract[];
  };
}
