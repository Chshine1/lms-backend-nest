import { Inject, Injectable } from '@nestjs/common';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { UserServicePatterns } from '@app/contracts/user/user.patterns';
import { ClientProxy } from '@nestjs/microservices';
import {
  SharedCreateUserDto,
  SharedUser,
  SharedValidateUserDto,
} from '../../common';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserServicePatterns> {
  constructor(@Inject('USER_SERVICE') client: ClientProxy) {
    super(client);
  }

  createUser(data: SharedCreateUserDto): Promise<SharedUser> {
    return this.send('user.create', data);
  }

  validateUser(data: SharedValidateUserDto): Promise<SharedUser | null> {
    return this.send('user.validate', data);
  }

  findUserById(id: number): Promise<SharedUser | null> {
    return this.send('user.findById', { id });
  }

  findUsersByTenant(tenantId: number): Promise<SharedUser[]> {
    return this.send('user.findByTenant', { tenantId });
  }
}
