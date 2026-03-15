import { CustomDecorator, SetMetadata } from '@nestjs/common';

export interface AuditMetadata {
  resourceType: string;
  action: string;
}

export const auditDecoratorKey = 'audit';
export const Audit = (resourceType: string, action: string): CustomDecorator =>
  SetMetadata<string, AuditMetadata>(auditDecoratorKey, {
    resourceType,
    action,
  });
