import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  providers: [AuditService],
  exports: [AuditInterceptor],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuditModule {}
