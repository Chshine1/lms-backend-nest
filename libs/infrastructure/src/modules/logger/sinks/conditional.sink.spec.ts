import { ConditionalSink } from './conditional.sink';
import { LogEntry } from '../contracts/log.entry';
import { Sink } from '../contracts/middlewares.interface';
import { LoggerSinkError } from '../errors/index';
import { LogLevel } from '@app/contracts';

describe('ConditionalSink', () => {
  let trueSink: jest.Mocked<Sink>;
  let falseSink: jest.Mocked<Sink>;
  let conditionalSink: Sink;
  let testEntry: LogEntry;

  function createMockSink(id: string): jest.Mocked<Sink> {
    return {
      id,
      emit: jest.fn().mockResolvedValue(undefined),
    };
  }

  function createConditionalSink(
    predicate: jest.Mock,
    trueSink: Sink,
    falseSink: Sink,
  ): ConditionalSink {
    return new ConditionalSink('conditional-1', predicate, trueSink, falseSink);
  }

  function createTestEntry(): LogEntry {
    return {
      level: LogLevel.INFO,
      message: 'test message',
      timestamp: new Date(),
      serviceName: 'testService',
    };
  }

  beforeEach(() => {
    trueSink = createMockSink('true-sink');
    falseSink = createMockSink('false-sink');
    testEntry = createTestEntry();
  });

  describe('emit', () => {
    describe('when predicate returns true', () => {
      it('should route to trueSink and not call falseSink', async () => {
        const predicate = jest.fn().mockReturnValue(true);
        conditionalSink = createConditionalSink(predicate, trueSink, falseSink);

        await conditionalSink.emit(testEntry);

        expect(predicate).toHaveBeenCalledWith(testEntry);
        expect(trueSink.emit).toHaveBeenCalledWith(testEntry);
        expect(falseSink.emit).not.toHaveBeenCalled();
      });
    });

    describe('when predicate returns false', () => {
      it('should route to falseSink and not call trueSink', async () => {
        const predicate = jest.fn().mockReturnValue(false);
        conditionalSink = createConditionalSink(predicate, trueSink, falseSink);

        await conditionalSink.emit(testEntry);

        expect(predicate).toHaveBeenCalledWith(testEntry);
        expect(falseSink.emit).toHaveBeenCalledWith(testEntry);
        expect(trueSink.emit).not.toHaveBeenCalled();
      });
    });

    describe('when handling errors', () => {
      describe('from trueSink', () => {
        it('should wrap trueSink errors in LoggerSinkError', async () => {
          const predicate = jest.fn().mockReturnValue(true);
          const originalError = new Error('true sink error');
          trueSink.emit.mockRejectedValue(originalError);
          conditionalSink = createConditionalSink(
            predicate,
            trueSink,
            falseSink,
          );

          const expectedRejects = expect(
            conditionalSink.emit(testEntry),
          ).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            cause: originalError,
          });
        });
      });

      describe('from predicate', () => {
        it('should wrap predicate errors in LoggerSinkError', async () => {
          const originalError = new Error('true sink error');
          const predicate = jest.fn().mockImplementation(() => {
            throw originalError;
          });
          conditionalSink = createConditionalSink(
            predicate,
            trueSink,
            falseSink,
          );

          const expectedRejects = expect(
            conditionalSink.emit(testEntry),
          ).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'conditional',
                  id: conditionalSink.id,
                },
              ],
            },
            cause: originalError,
          });
        });
      });

      describe('when handling nested LoggerSinkError', () => {
        it('should combine error stacks from trueSink nested error', async () => {
          const predicate = jest.fn().mockReturnValue(true);
          const rootError = new Error('nested sink error');
          const nestedError = new LoggerSinkError(
            [{ type: 'nested', id: trueSink.id }],
            rootError,
          );
          trueSink.emit.mockRejectedValue(nestedError);
          conditionalSink = createConditionalSink(
            predicate,
            trueSink,
            falseSink,
          );

          const expectedRejects = expect(
            conditionalSink.emit(testEntry),
          ).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'nested',
                  id: trueSink.id,
                },
                {
                  type: 'conditional',
                  id: conditionalSink.id,
                },
              ],
            },
            cause: rootError,
          });
        });
      });
    });
  });
});
