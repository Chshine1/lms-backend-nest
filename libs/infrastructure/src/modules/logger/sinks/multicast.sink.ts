import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { createLoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

export class MulticastSink implements Sink {
  constructor(
    public readonly id: string,
    private sinks: Sink[],
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    const promises = this.sinks.map((sink) => sink.emit(entry));
    const results = await Promise.allSettled(promises);

    const errors = results
      .map((result, index) => {
        return result.status === 'rejected'
          ? {
              reason: result.reason as unknown,
              id: this.sinks[index]?.id || 'unknown',
            }
          : undefined;
      })
      .filter((result) => result !== undefined);

    if (errors.length > 0) {
      throw createLoggerSinkError(
        {
          type: 'multicast',
          id: this.id,
          details: {
            errorSinks: errors.map((e) => {
              return {
                id: e.id,
                message:
                  e.reason instanceof Error
                    ? e.reason.message
                    : String(e.reason),
              };
            }),
          },
        },
        new AggregateError(errors.map((e) => e.reason)),
      );
    }
  }
}
