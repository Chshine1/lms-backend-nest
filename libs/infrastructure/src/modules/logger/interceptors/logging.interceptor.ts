import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LoggerService } from '../logger.service';
import { LogLevel } from '@app/contracts';
import { LOG_METADATA_KEY, LogOptions } from '../decorators/log.decorator';

type MinimalHttpRequest = {
  method: string;
  path: string;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const extra = this.reflector.getAllAndOverride<LogOptions | undefined>(
      LOG_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const ctx = this.buildContext(context, extra);

    return next.handle().pipe(
      switchMap((data: unknown) =>
        from(
          this.logAndFlush(LogLevel.INFO, 'handler completed', ctx, start),
        ).pipe(map(() => data)),
      ),
      catchError((err: unknown) =>
        from(
          this.logAndFlush(LogLevel.ERROR, 'handler error', {error: err, ...ctx}, start),
        ).pipe(switchMap(() => throwError(() => err))),
      ),
    );
  }

  private buildContext(
    context: ExecutionContext,
    extra: LogOptions | undefined,
  ): Record<string, unknown> {
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    if (isRabbitContext(context)) {
      return {
        protocol: 'rabbitmq',
        handler: `${className}.${handlerName}`,
        ...(extra?.context ?? {}),
      };
    }

    const req = context.switchToHttp().getRequest<MinimalHttpRequest>();
    return {
      protocol: 'http',
      method: req.method,
      path: req.path,
      handler: `${className}.${handlerName}`,
      ...(extra?.context ?? {}),
    };
  }

  private async logAndFlush(
    level: LogLevel,
    message: string,
    context: Record<string, unknown>,
    start: number,
  ): Promise<void> {
    await this.logger.log({
      level,
      message,
      context: { ...context, durationMs: Date.now() - start },
    });
    await this.logger.flush();
  }
}
