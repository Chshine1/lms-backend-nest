import { Injectable } from '@nestjs/common';
import {
  SharedCreateUserDto,
  SharedUser,
  SharedValidateUserDto,
} from '../../../../libs/common';
import { UserTypedClient } from '@app/typed-client/user.typed-client';

@Injectable()
export class UserClientService {
  constructor(private readonly client: UserTypedClient) {}

  createUser(data: SharedCreateUserDto): Promise<SharedUser> {
    return this.client.createUser(data);
  }

  validateUser(data: SharedValidateUserDto): Promise<SharedUser | null> {
    return this.client.validateUser(data);
  }

  findUserById(id: number): Promise<SharedUser | null> {
    return this.client.findUserById(id);
  }

  findUsersByTenant(tenantId: number): Promise<SharedUser[]> {
    return this.client.findUsersByTenant(tenantId);
  }
}
