import { ConditionalSink } from './conditional.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

describe('ConditionalSink', () => {
  let trueSink: jest.Mocked<Sink>;
  let falseSink: jest.Mocked<Sink>;
  let conditionalSink: Sink;
  let testEntry: LogEntry;

  beforeEach(() => {
    trueSink = {
      id: 'true-sink-1',
      emit: jest.fn().mockResolvedValue(undefined),
    };
    falseSink = {
      id: 'false-sink-1',
      emit: jest.fn().mockResolvedValue(undefined),
    };
    testEntry = {
      level: LogLevel.INFO,
      message: 'test message',
      timestamp: new Date(),
      serviceName: 'testService',
    };
  });

  describe('emit', () => {
    it('should route to trueSink when predicate returns true', async () => {
      const predicate = jest.fn().mockReturnValue(true);
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      await conditionalSink.emit(testEntry);

      expect(predicate).toHaveBeenCalledWith(testEntry);
      expect(trueSink.emit).toHaveBeenCalledWith(testEntry);
      expect(falseSink.emit).not.toHaveBeenCalled();
    });

    it('should route to falseSink when predicate returns false', async () => {
      const predicate = jest.fn().mockReturnValue(false);
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      await conditionalSink.emit(testEntry);

      expect(predicate).toHaveBeenCalledWith(testEntry);
      expect(falseSink.emit).toHaveBeenCalledWith(testEntry);
      expect(trueSink.emit).not.toHaveBeenCalled();
    });

    it('should handle errors from trueSink and wrap them in LoggerSinkError', async () => {
      const predicate = jest.fn().mockReturnValue(true);
      const originalError = new Error('true sink error');
      trueSink.emit.mockRejectedValue(originalError);
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      try {
        await conditionalSink.emit(testEntry);
      } catch (error) {
        expect(error).toBeInstanceOf(LoggerSinkError);
        const typedError = error as LoggerSinkError;

        expect(typedError.message).toBe(
          'Logging pipeline breaks due to sink errors',
        );
        expect(typedError.cause).toBe(originalError);
      }
    });

    it('should handle errors from falseSink and wrap them in LoggerSinkError', async () => {
      const predicate = jest.fn().mockReturnValue(false);
      const originalError = new Error('false sink error');
      falseSink.emit.mockRejectedValue(originalError);
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      try {
        await conditionalSink.emit(testEntry);
      } catch (error) {
        expect(error).toBeInstanceOf(LoggerSinkError);
        const typedError = error as LoggerSinkError;

        expect(typedError.message).toBe(
          'Logging pipeline breaks due to sink errors',
        );
        expect(typedError.cause).toBe(originalError);
      }
    });

    it('should handle predicate throwing an error', async () => {
      const predicate = jest.fn().mockImplementation(() => {
        throw new Error('predicate error');
      });
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      try {
        await conditionalSink.emit(testEntry);
      } catch (error) {
        expect(error).toBeInstanceOf(LoggerSinkError);
        const typedError = error as LoggerSinkError;

        expect(typedError.message).toBe(
          'Logging pipeline breaks due to sink errors',
        );
        expect(typedError.cause).toEqual(new Error('predicate error'));
      }
    });

    it('should handle nested LoggerSinkError from trueSink', async () => {
      const predicate = jest.fn().mockReturnValue(true);
      const nestedError = new LoggerSinkError(
        [{ type: 'nested', id: 'nested-sink' }],
        new Error('nested sink error'),
      );
      trueSink.emit.mockRejectedValue(nestedError);
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      try {
        await conditionalSink.emit(testEntry);
      } catch (error) {
        expect(error).toBeInstanceOf(LoggerSinkError);
        const typedError = error as LoggerSinkError;

        expect(typedError.context.sinkErrorStack).toHaveLength(2);
        expect(typedError.context.sinkErrorStack[0]).toMatchObject({
          type: 'nested',
          id: 'nested-sink',
        });
        expect(typedError.context.sinkErrorStack[1]).toMatchObject({
          type: 'conditional',
          id: 'conditional-1',
        });
      }
    });
  });
});
