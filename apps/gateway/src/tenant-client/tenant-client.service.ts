import { Injectable } from '@nestjs/common';
import { SharedCreateTenantDto, SharedTenant } from '../../../../libs/common';
import { TenantTypedClient } from '@app/typed-client/tenant.typed-client';

@Injectable()
export class TenantClientService {
  constructor(private readonly client: TenantTypedClient) {}

  async createTenant(data: SharedCreateTenantDto): Promise<SharedTenant> {
    return this.client.createTenant(data);
  }

  async findTenantById(id: number): Promise<SharedTenant | null> {
    return this.client.findTenantById(id);
  }

  async validateTenant(id: number): Promise<boolean> {
    return this.client.validateTenant(id);
  }
}
