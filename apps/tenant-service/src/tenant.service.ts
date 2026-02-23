import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantContract } from '@app/contracts/tenant/entities/tenant.contract';
import { plainToInstance } from 'class-transformer';
import { CreateTenantDto } from '@app/contracts/tenant/dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantContract> {
    const tenant = this.tenantRepository.create(createTenantDto);
    const createResult = await this.tenantRepository.save(tenant);
    return plainToInstance(TenantContract, createResult, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<TenantContract | null> {
    const findResult = await this.tenantRepository.findOne({ where: { id } });
    if (findResult === null) return null;
    return plainToInstance(TenantContract, findResult, {
      excludeExtraneousValues: true,
    });
  }

  async findByName(name: string): Promise<TenantContract | null> {
    const findResult = await this.tenantRepository.findOne({ where: { name } });
    if (findResult === null) return null;
    return plainToInstance(TenantContract, findResult, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    updateData: Partial<TenantContract>,
  ): Promise<number | undefined> {
    const result = await this.tenantRepository.update(id, updateData);
    return result.affected;
  }

  async delete(id: number): Promise<void> {
    await this.tenantRepository.delete(id);
  }
}
