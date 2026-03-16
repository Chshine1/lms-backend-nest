import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

export class NullSink implements Sink {
  emit(): Promise<void> {
    return Promise.resolve();
  }
}
