import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TenantClientService {
  constructor(@Inject('TENANT_SERVICE') private client: ClientProxy) {}
  
  async createTenant(data: any) {
    return lastValueFrom(this.client.send('tenant.create', data));
  }
  
  async findTenantById(id: number) {
    return lastValueFrom(this.client.send('tenant.findById', { id }));
  }
  
  async validateTenant(id: number) {
    return lastValueFrom(this.client.send('tenant.validate', { id }));
  }
}