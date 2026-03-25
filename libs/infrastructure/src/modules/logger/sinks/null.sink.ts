import { Sink } from '../contracts/middlewares.interface';

export class NullSink implements Sink {
  constructor(public readonly id: string) {}

  emit(): Promise<void> {
    return Promise.resolve();
  }
}
