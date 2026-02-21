import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserClientService {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  async createUser(data: any) {
    return lastValueFrom(this.client.send('user.create', data));
  }

  async validateUser(data: { username: string; password: string }) {
    return lastValueFrom(this.client.send('user.validate', data));
  }

  async findUserById(id: number) {
    return lastValueFrom(this.client.send('user.findById', { id }));
  }

  async findUsersByTenant(tenantId: number) {
    return lastValueFrom(this.client.send('user.findByTenant', { tenantId }));
  }
}
