import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @MessagePattern('tenant.create')
  async createTenant(@Payload() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @MessagePattern('tenant.findById')
  async findTenantById(@Payload() data: { id: number }) {
    return this.tenantService.findById(data.id);
  }

  @MessagePattern('tenant.findByName')
  async findTenantByName(@Payload() data: { name: string }) {
    return this.tenantService.findByName(data.name);
  }

  @MessagePattern('tenant.validate')
  async validateTenant(@Payload() data: { id: number }) {
    const tenant = await this.tenantService.findById(data.id);
    return !!tenant;
  }

  @MessagePattern('tenant.update')
  async updateTenant(@Payload() data: { id: number; updateData: any }) {
    return this.tenantService.update(data.id, data.updateData);
  }

  @MessagePattern('tenant.delete')
  async deleteTenant(@Payload() data: { id: number }) {
    await this.tenantService.delete(data.id);
    return { success: true };
  }
}
