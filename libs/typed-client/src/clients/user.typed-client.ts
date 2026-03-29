import { Inject, Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypedClientBase } from '../typed-client.base';
import {
  CreateUserDto,
  UserContract,
  ValidateUserDto,
  TenantContract,
} from '@app/contracts';
import {
  TYPED_CLIENT_MQ_OPTIONS,
  type TypedClientMqOptions,
} from '../typed-client.module';
import { UserPatterns } from '../patterns/user.patterns';
import { TraceService } from '@app/trace';

@Injectable()
export class UserTypedClient extends TypedClientBase<UserPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    traceService: TraceService,
    @Inject(TYPED_CLIENT_MQ_OPTIONS)
    options: TypedClientMqOptions,
  ) {
    super(amqpConnection, traceService, options);
  }

  createUser(data: CreateUserDto): Promise<UserContract> {
    return this.rpc('user.create', data);
  }

  validateUser(data: ValidateUserDto): Promise<UserContract | null> {
    return this.rpc('user.validate', data);
  }

  findUserById(id: number): Promise<UserContract | null> {
    return this.rpc('user.findById', { id });
  }

  findTenantById(id: number): Promise<TenantContract | null> {
    return this.rpc('tenant.findById', id);
  }

  validateTenant(id: number): Promise<TenantContract | null> {
    return this.rpc('tenant.validate', id);
  }
}
