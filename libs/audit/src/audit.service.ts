import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';

export interface AuditLogPayload {
  actor: { header: string };
  action: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

@Injectable()
export class AuditService {
  constructor(private readonly loggerService: LoggerService) {}

  log(payload: AuditLogPayload): void {
    const auditEntry = {
      ...payload,
      '@type': 'AUDIT',
    };
    void this.loggerService.log({
      level: LogLevel.INFO,
      message: 'Audit log info',
      context: auditEntry,
    });
  }
}
