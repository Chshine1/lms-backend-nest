import { Module } from '@nestjs/common';
import { TraceService } from './trace.service';

@Module({
  providers: [TraceService],
  exports: [TraceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TraceModule {}
