import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { TraceService } from './trace.service';

@Injectable()
export class RabbitMqTraceInterceptor implements NestInterceptor {
  constructor(private readonly trace: TraceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (isRabbitContext(context)) {
      const rpcContext = context.switchToRpc();
      const headers = rpcContext.getContext().getHeaders?.() || {};
      let traceId = headers['x-trace-id'];
      if (!traceId) {
        traceId = this.trace.generateTraceId();
      }
      return new Observable((subscriber) => {
        this.trace.runWithTrace(traceId, () => {
          next.handle().subscribe({
            next: (val) => {
              subscriber.next(val);
            },
            error: (err) => {
              subscriber.error(err);
            },
            complete: () => {
              subscriber.complete();
            },
          });
        });
      });
    }
    return next.handle();
  }
}
