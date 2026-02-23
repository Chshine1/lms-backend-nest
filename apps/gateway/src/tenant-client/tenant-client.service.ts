import { Injectable } from '@nestjs/common';
import { TenantTypedClient } from '@app/typed-client/tenant.typed-client';
import { TenantContract } from '@app/contracts/tenant/entities/tenant.contract';
import { CreateTenantDto } from '@app/contracts/tenant/dto/create-tenant.dto';

@Injectable()
export class TenantClientService {
  constructor(private readonly client: TenantTypedClient) {}

  async createTenant(data: CreateTenantDto): Promise<TenantContract> {
    return this.client.createTenant(data);
  }

  async findTenantById(id: number): Promise<TenantContract | null> {
    return this.client.findTenantById(id);
  }

  async validateTenant(id: number): Promise<boolean> {
    return this.client.validateTenant(id);
  }
}
