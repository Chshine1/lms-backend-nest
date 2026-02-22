import { SharedCreateTenantDto, SharedTenant } from '../../../common';

export interface TenantServicePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'tenant.create': {
    request: SharedCreateTenantDto;
    response: SharedTenant;
  };
  'tenant.findById': {
    request: { id: number };
    response: SharedTenant | null;
  };
  'tenant.findByName': {
    request: { name: string };
    response: SharedTenant | null;
  };
  'tenant.validate': {
    request: { id: number };
    response: boolean;
  };
  'tenant.update': {
    request: { id: number; updateData: Partial<SharedTenant> };
    response: number | undefined;
  };
  'tenant.delete': {
    request: { id: number };
    response: boolean;
  };
}
