import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { TraceService } from './trace.service';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  constructor(private readonly trace: TraceService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const traceId =
      (req.headers['x-trace-id'] as string) || this.trace.generateTraceId();
    this.trace.runWithTrace(traceId, () => {
      next();
    });
  }
}
