import { Injectable } from '@nestjs/common';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';
import { ValidateUserDto } from '@app/contracts/user/dto/validate-user.dto';
import { UserTypedClient } from '@app/typed-client/clients/user.typed-client';

@Injectable()
export class UserClientService {
  constructor(private readonly client: UserTypedClient) {}

  createUser(data: CreateUserDto): Promise<UserContract> {
    return this.client.createUser(data);
  }

  validateUser(data: ValidateUserDto): Promise<UserContract | null> {
    return this.client.validateUser(data);
  }

  findUserById(id: number): Promise<UserContract | null> {
    return this.client.findUserById(id);
  }
}
