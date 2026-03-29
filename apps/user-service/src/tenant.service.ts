import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantContract } from '@app/contracts';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async findById(id: number): Promise<TenantContract | null> {
    const findResult = await this.tenantRepository.findOne({ where: { id } });
    if (findResult === null) return null;
    return plainToInstance(TenantContract, findResult, {
      excludeExtraneousValues: true,
    });
  }

  async validateTenant(id: number): Promise<TenantContract | null> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, status: 'active' },
    });
    if (tenant === null) return null;
    return plainToInstance(TenantContract, tenant, {
      excludeExtraneousValues: true,
    });
  }
}
