import { RegisterUserDto, UserDto } from '@app/contracts';

export interface UserPatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'user.register': {
    request: RegisterUserDto;
    response: UserDto;
  };
  'user.find-by-id': {
    request: {
      userId: bigint;
    };
    response: UserDto | null;
  };
  'user.assign-role': {
    request: {
      adminUserId: bigint;
      targetUserId: bigint;
      roleId: bigint;
    };
    response: void;
  };
  'user.link-parent-student': {
    request: {
      parentUserId: bigint;
      studentUserId: bigint;
    };
    response: void;
  };
  'user.complete-onboarding': {
    request: {
      studentUserId: bigint;
      signatureData?: Record<string, unknown>;
    };
    response: void;
  };
}
