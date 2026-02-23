import { Inject, Injectable } from '@nestjs/common';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { UserServicePatterns } from '@app/contracts/user/user.patterns';
import { ClientProxy } from '@nestjs/microservices';
import { UserContract } from '@app/contracts/user/entities/user.contract';
import { CreateUserDto } from '@app/contracts/user/dto/create-user.dto';
import { ValidateUserDto } from '@app/contracts/user/dto/validate-user.dto';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserServicePatterns> {
  constructor(@Inject('USER_SERVICE') client: ClientProxy) {
    super(client);
  }

  createUser(data: CreateUserDto): Promise<UserContract> {
    return this.send('user.create', data);
  }

  validateUser(data: ValidateUserDto): Promise<UserContract | null> {
    return this.send('user.validate', data);
  }

  findUserById(id: number): Promise<UserContract | null> {
    return this.send('user.findById', { id });
  }

  findUsersByTenant(tenantId: number): Promise<UserContract[]> {
    return this.send('user.findByTenant', { tenantId });
  }
}
