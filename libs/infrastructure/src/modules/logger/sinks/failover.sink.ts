import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LogEntry } from '@app/infrastructure/modules/logger/contracts/log.entry';
import { createLoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

export class FailoverSink implements Sink {
  constructor(
    public readonly id: string,
    private primary: Sink,
    private fallbacks: Sink[],
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    try {
      await this.primary.emit(entry);
    } catch (primaryError: unknown) {
      const fallbackErrors: {
        id: string;
        reason: unknown;
      }[] = [];
      for (const fb of this.fallbacks) {
        try {
          await fb.emit(entry);
          break;
        } catch (fallbackError: unknown) {
          fallbackErrors.push({
            id: fb.id,
            reason: fallbackError,
          });
        }
      }

      const finalError: unknown =
        fallbackErrors.length === 0
          ? primaryError
          : new AggregateError([
              primaryError,
              new AggregateError(fallbackErrors),
            ]);
      const allFailed = fallbackErrors.length === this.fallbacks.length;
      if (allFailed) {
        console.log(JSON.stringify(entry));
      }
      throw createLoggerSinkError(
        {
          type: 'failover',
          id: this.id,
          details: {
            allFailed,
            errorSinks: [
              {
                type: 'primary',
                id: this.primary.id,
              },
              ...fallbackErrors.map((value) => {
                return {
                  type: 'fallback',
                  id: value.id,
                };
              }),
            ],
          },
        },
        finalError,
      );
    }
  }
}
