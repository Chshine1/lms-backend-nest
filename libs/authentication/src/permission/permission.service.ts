import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from '@app/authentication/permission/permission.interface';

@Injectable()
export class PermissionService {
  // TODO: Use cache here
  constructor(private readonly permissionRepo: Repository<Permission>) {}

  async getUserPermissions(userId: number): Promise<Permission[]> {
    try {
      return await this.permissionRepo.find({ where: { userId } });
    } catch {
      return [];
    }
  }
}
