import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from '@/tenant-service/src/entities/tenant.entity';

@Controller()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @MessagePattern('tenant.create')
  async createTenant(
    @Payload() createTenantDto: CreateTenantDto,
  ): Promise<Tenant> {
    return this.tenantService.create(createTenantDto);
  }

  @MessagePattern('tenant.findById')
  async findTenantById(
    @Payload() data: { id: number },
  ): Promise<Tenant | null> {
    return this.tenantService.findById(data.id);
  }

  @MessagePattern('tenant.findByName')
  async findTenantByName(
    @Payload() data: { name: string },
  ): Promise<Tenant | null> {
    return this.tenantService.findByName(data.name);
  }

  @MessagePattern('tenant.validate')
  async validateTenant(@Payload() data: { id: number }): Promise<boolean> {
    const tenant = await this.tenantService.findById(data.id);
    return !!tenant;
  }

  @MessagePattern('tenant.update')
  async updateTenant(
    @Payload() data: { id: number; updateData: Partial<Tenant> },
  ): Promise<number | undefined> {
    return this.tenantService.update(data.id, data.updateData);
  }

  @MessagePattern('tenant.delete')
  async deleteTenant(@Payload() data: { id: number }): Promise<boolean> {
    await this.tenantService.delete(data.id);
    return true;
  }
}
