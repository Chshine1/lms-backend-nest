import { TenantServicePatterns } from '@app/contracts/tenant/tenant.patterns';
import { Inject, Injectable } from '@nestjs/common';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { ClientProxy } from '@nestjs/microservices';
import { TenantContract } from '@app/contracts/tenant/entities/tenant.contract';
import { CreateTenantDto } from '@app/contracts/tenant/dto/create-tenant.dto';

@Injectable()
export class TenantTypedClient extends TypedClientBase<TenantServicePatterns> {
  constructor(@Inject('TENANT_SERVICE') client: ClientProxy) {
    super(client);
  }

  createTenant(data: CreateTenantDto): Promise<TenantContract> {
    return this.send('tenant.create', data);
  }

  findTenantById(id: number): Promise<TenantContract | null> {
    return this.send('tenant.findById', { id });
  }

  validateTenant(id: number): Promise<boolean> {
    return this.send('tenant.validate', { id });
  }
}
