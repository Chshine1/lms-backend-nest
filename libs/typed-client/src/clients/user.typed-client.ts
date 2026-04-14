import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { UserPatterns } from '../patterns/user.patterns';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super('user-service', amqpConnection, userContextService, options);
  }

  registerUser(
    data: UserPatterns['user.register']['request'],
  ): Promise<UserPatterns['user.register']['response']> {
    return this.rpc('user.register', data);
  }

  findUserById(
    data: UserPatterns['user.find-by-id']['request'],
  ): Promise<UserPatterns['user.find-by-id']['response']> {
    return this.rpc('user.find-by-id', data);
  }

  assignRole(
    data: UserPatterns['user.assign-role']['request'],
  ): Promise<UserPatterns['user.assign-role']['response']> {
    return this.rpc('user.assign-role', data);
  }

  linkParentStudent(
    data: UserPatterns['user.link-parent-student']['request'],
  ): Promise<UserPatterns['user.link-parent-student']['response']> {
    return this.rpc('user.link-parent-student', data);
  }

  completeOnboarding(
    data: UserPatterns['user.complete-onboarding']['request'],
  ): Promise<UserPatterns['user.complete-onboarding']['response']> {
    return this.rpc('user.complete-onboarding', data);
  }

  userLogin(
    data: UserPatterns['user.login']['request'],
  ): Promise<UserPatterns['user.login']['response']> {
    return this.rpc('user.login', data);
  }
}
