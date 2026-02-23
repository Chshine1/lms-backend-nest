import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TenantService } from './tenant.service';
import { TenantContract } from '@app/contracts/tenant/entities/tenant.contract';
import { CreateTenantDto } from '@app/contracts/tenant/dto/create-tenant.dto';

@Controller()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @MessagePattern('tenant.create')
  createTenant(
    @Payload() createTenantDto: CreateTenantDto,
  ): Promise<TenantContract> {
    return this.tenantService.create(createTenantDto);
  }

  @MessagePattern('tenant.findById')
  findTenantById(
    @Payload() data: { id: number },
  ): Promise<TenantContract | null> {
    return this.tenantService.findById(data.id);
  }

  @MessagePattern('tenant.findByName')
  findTenantByName(
    @Payload() data: { name: string },
  ): Promise<TenantContract | null> {
    return this.tenantService.findByName(data.name);
  }

  @MessagePattern('tenant.validate')
  async validateTenant(@Payload() data: { id: number }): Promise<boolean> {
    const tenant = await this.tenantService.findById(data.id);
    return !!tenant;
  }

  @MessagePattern('tenant.update')
  updateTenant(
    @Payload() data: { id: number; updateData: Partial<TenantContract> },
  ): Promise<number | undefined> {
    return this.tenantService.update(data.id, data.updateData);
  }

  @MessagePattern('tenant.delete')
  async deleteTenant(@Payload() data: { id: number }): Promise<boolean> {
    await this.tenantService.delete(data.id);
    return true;
  }
}
