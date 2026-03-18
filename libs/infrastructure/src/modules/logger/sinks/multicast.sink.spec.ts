import { MulticastSink } from './multicast.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

describe('MulticastSink', () => {
  let sink1: jest.Mocked<Sink>;
  let sink2: jest.Mocked<Sink>;
  let sink3: jest.Mocked<Sink>;
  let multicastSink: Sink;
  let testEntry: LogEntry;

  function createMockSink(id: string): jest.Mocked<Sink> {
    return {
      id,
      emit: jest.fn().mockResolvedValue(undefined),
    };
  }

  function createMulticastSink(sinks: Sink[]): MulticastSink {
    return new MulticastSink('multicast-1', sinks);
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
    sink1 = createMockSink('sink-1');
    sink2 = createMockSink('sink-2');
    sink3 = createMockSink('sink-3');
    testEntry = createTestEntry();
  });

  describe('emit', () => {
    describe('when all sinks succeed', () => {
      it('should emit to all sinks', async () => {
        multicastSink = createMulticastSink([sink1, sink2, sink3]);

        await multicastSink.emit(testEntry);

        expect(sink1.emit).toHaveBeenCalledWith(testEntry);
        expect(sink2.emit).toHaveBeenCalledWith(testEntry);
        expect(sink3.emit).toHaveBeenCalledWith(testEntry);
      });
    });

    describe('when handling errors', () => {
      describe('with multiple failures', () => {
        it('should throw LoggerSinkError with error details', async () => {
          const sink1Error = new Error('sink1 failed');
          const sink3Error = new Error('sink3 failed');

          sink1.emit.mockRejectedValue(sink1Error);
          sink3.emit.mockRejectedValue(sink3Error);

          multicastSink = createMulticastSink([sink1, sink2, sink3]);

          const expectedRejects = expect(multicastSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'multicast',
                  id: multicastSink.id,
                  details: {
                    errorSinks: [
                      {
                        id: sink1.id,
                        message: sink1Error.message,
                      },
                      {
                        id: sink3.id,
                        message: sink3Error.message,
                      },
                    ],
                  },
                },
              ],
            },
            cause: expect.objectContaining({
              errors: [sink1Error, sink3Error],
            }) as AggregateError,
          });

          expect(sink1.emit).toHaveBeenCalledWith(testEntry);
          expect(sink2.emit).toHaveBeenCalledWith(testEntry);
          expect(sink3.emit).toHaveBeenCalledWith(testEntry);
        });
      });

      describe('with empty sinks array', () => {
        it('should resolve without errors', async () => {
          multicastSink = createMulticastSink([]);

          await expect(multicastSink.emit(testEntry)).resolves.toBeUndefined();
        });
      });

      describe('when all sinks fail', () => {
        it('should throw LoggerSinkError with complete error context', async () => {
          const sink1Error = new Error('sink1 failed');
          const sink2Error = new Error('sink2 failed');
          const sink3Error = new Error('sink3 failed');

          sink1.emit.mockRejectedValue(sink1Error);
          sink2.emit.mockRejectedValue(sink2Error);
          sink3.emit.mockRejectedValue(sink3Error);

          multicastSink = createMulticastSink([sink1, sink2, sink3]);

          const expectedRejects = expect(multicastSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'multicast',
                  id: multicastSink.id,
                  details: {
                    errorSinks: [
                      { id: sink1.id, message: sink1Error.message },
                      { id: sink2.id, message: sink2Error.message },
                      { id: sink3.id, message: sink3Error.message },
                    ],
                  },
                },
              ],
            },
            cause: expect.objectContaining({
              errors: [sink1Error, sink2Error, sink3Error],
            }) as AggregateError,
          });

          expect(sink1.emit).toHaveBeenCalledWith(testEntry);
          expect(sink2.emit).toHaveBeenCalledWith(testEntry);
          expect(sink3.emit).toHaveBeenCalledWith(testEntry);
        });
      });

      describe('when handling nested LoggerSinkError', () => {
        it('should combine error stacks from nested errors', async () => {
          const rootError = new Error('nested sink error');
          const nestedError = new LoggerSinkError(
            [{ type: 'nested', id: sink1.id }],
            rootError,
          );

          sink1.emit.mockRejectedValue(nestedError);
          sink2.emit.mockRejectedValue(new Error('sink2 failed'));

          multicastSink = createMulticastSink([sink1, sink2, sink3]);

          const expectedRejects = expect(multicastSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'nested',
                  id: sink1.id,
                },
                {
                  type: 'multicast',
                  id: multicastSink.id,
                },
              ],
            },
            cause: rootError,
          });

          expect(sink1.emit).toHaveBeenCalledWith(testEntry);
          expect(sink2.emit).toHaveBeenCalledWith(testEntry);
          expect(sink3.emit).toHaveBeenCalledWith(testEntry);
        });
      });
    });
  });
});
