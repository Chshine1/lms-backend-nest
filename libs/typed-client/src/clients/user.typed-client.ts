import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { UserPatterns } from '../patterns/user.patterns';
import { CreateUserDto, UserContract, UserLoginDto } from '@app/contracts';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  createUser(createUserDto: CreateUserDto): Promise<UserContract> {
    return this.rpc('user.create', createUserDto);
  }

  userLogin(userLoginDto: UserLoginDto): Promise<string> {
    return this.rpc('user.login', userLoginDto);
  }
}
