import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { UserPatterns } from '../patterns/user.patterns';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  validateUserExists(id: number[]): Promise<boolean[]> {
    return this.rpc('user.validateExists', id);
  }
}
