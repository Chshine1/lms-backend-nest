import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { AuditService } from '../audit.service';
import {
  auditDecoratorKey,
  AuditMetadata,
} from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditMeta = this.reflector.get<AuditMetadata | undefined>(
      auditDecoratorKey,
      context.getHandler(),
    );
    if (!auditMeta) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const actor = { header: req.headers.authorization || '' };
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    return next.handle().pipe(
      tap(() => {
        this.auditService.log({
          actor,
          action: auditMeta.action,
          ip,
          userAgent,
          timestamp: new Date(),
        });
      }),
    );
  }
}
