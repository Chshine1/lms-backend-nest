import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async findById(id: number): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { name } });
  }

  async update(
    id: number,
    updateData: Partial<Tenant>,
  ): Promise<number | undefined> {
    const result = await this.tenantRepository.update(id, updateData);
    return result.affected;
  }

  async delete(id: number): Promise<void> {
    await this.tenantRepository.delete(id);
  }
}
