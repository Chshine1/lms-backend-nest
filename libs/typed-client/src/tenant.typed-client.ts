import { TenantServicePatterns } from '@app/contracts/tenant/tenant.patterns';
import { Inject, Injectable } from '@nestjs/common';
import { TypedClientBase } from '@app/typed-client/typed-client.base';
import { ClientProxy } from '@nestjs/microservices';
import { SharedCreateTenantDto, SharedTenant } from '../../common';

@Injectable()
export class TenantTypedClient extends TypedClientBase<TenantServicePatterns> {
  constructor(@Inject('TENANT_SERVICE') client: ClientProxy) {
    super(client);
  }

  createTenant(data: SharedCreateTenantDto): Promise<SharedTenant> {
    return this.send('tenant.create', data);
  }

  findTenantById(id: number): Promise<SharedTenant | null> {
    return this.send('tenant.findById', { id });
  }

  validateTenant(id: number): Promise<boolean> {
    return this.send('tenant.validate', { id });
  }
}
