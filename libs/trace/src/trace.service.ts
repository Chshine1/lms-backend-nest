import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

@Injectable({ scope: Scope.DEFAULT })
export class TraceService {
  private readonly als = new AsyncLocalStorage<{ traceId: string }>();

  runWithTrace(traceId: string, callback: () => any) {
    return this.als.run({ traceId }, callback);
  }

  getTraceId(): string | undefined {
    return this.als.getStore()?.traceId;
  }

  generateTraceId(): string {
    return randomUUID();
  }
}
