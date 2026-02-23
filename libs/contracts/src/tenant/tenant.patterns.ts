import { TenantContract } from '@app/contracts/tenant/entities/tenant.contract';
import { CreateTenantDto } from '@app/contracts/tenant/dto/create-tenant.dto';

export interface TenantServicePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'tenant.create': {
    request: CreateTenantDto;
    response: TenantContract;
  };
  'tenant.findById': {
    request: { id: number };
    response: TenantContract | null;
  };
  'tenant.findByName': {
    request: { name: string };
    response: TenantContract | null;
  };
  'tenant.validate': {
    request: { id: number };
    response: boolean;
  };
  'tenant.update': {
    request: { id: number; updateData: Partial<TenantContract> };
    response: number | undefined;
  };
  'tenant.delete': {
    request: { id: number };
    response: boolean;
  };
}
