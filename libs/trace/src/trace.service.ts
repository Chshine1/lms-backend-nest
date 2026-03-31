import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

@Injectable()
export class TraceService {
  private readonly als = new AsyncLocalStorage<{ traceId: string }>();

  runWithTrace<T>(traceId: string, callback: () => T): T {
    return this.als.run({ traceId }, callback);
  }

  getTraceId(): string | undefined {
    return this.als.getStore()?.traceId;
  }

  generateTraceId(): string {
    return randomUUID();
  }
}
