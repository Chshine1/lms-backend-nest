import { Sink } from '@app/infrastructure/modules/logger/pipeline/middlewares.interface';

export class NullSink implements Sink {
  async emit(): Promise<void> {
    return Promise.resolve();
  }
}
