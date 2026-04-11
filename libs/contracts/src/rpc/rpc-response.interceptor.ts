import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { RpcResult } from './rpc-result';

@Injectable()
export class RpcResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') return next.handle();

    return next.handle().pipe(
      map(
        (data: unknown): RpcResult<unknown> => ({
          success: true,
          data,
          timestamp: new Date(),
        }),
      ),
    );
  }
}
