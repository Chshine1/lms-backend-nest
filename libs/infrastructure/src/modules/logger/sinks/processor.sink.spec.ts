import { ProcessorSink } from './processor.sink';
import { LogEntry } from '../contracts/log.entry';
import { Processor, Sink } from '../contracts/middlewares.interface';
import { LoggerSinkError } from '../errors/index';
import { LogLevel } from '@app/contracts';

describe('ProcessorSink', () => {
  let processor: jest.Mocked<Processor>;
  let nextSink: jest.Mocked<Sink>;
  let processorSink: Sink;
  let testEntry: LogEntry;

  function createMockSink(id: string): jest.Mocked<Sink> {
    return {
      id,
      emit: jest.fn().mockResolvedValue(undefined),
    };
  }

  function createProcessorSink(
    processor: Processor,
    nextSink: Sink,
  ): ProcessorSink {
    return new ProcessorSink('processor-1', processor, nextSink);
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
    processor = { process: jest.fn() };
    nextSink = createMockSink('next-sink-1');
    testEntry = createTestEntry();
  });

  describe('emit', () => {
    describe('when processing succeeds', () => {
      it('should process entry and emit to next sink', async () => {
        const originalEntry: LogEntry = {
          level: LogLevel.INFO,
          message: 'original message',
          timestamp: new Date(),
          serviceName: 'testService',
        };

        const processedEntry: LogEntry = {
          level: LogLevel.INFO,
          message: 'processed message',
          timestamp: new Date(),
          context: { processed: true },
          serviceName: 'testService',
        };

        processor.process.mockResolvedValue(processedEntry);
        processorSink = createProcessorSink(processor, nextSink);

        await processorSink.emit(originalEntry);

        expect(processor.process).toHaveBeenCalledWith(originalEntry);
        expect(nextSink.emit).toHaveBeenCalledWith(processedEntry);
      });
    });

    describe('when handling errors', () => {
      describe('from processor', () => {
        it('should wrap processor errors in LoggerSinkError', async () => {
          const originalError = new Error('processor failed');
          processor.process.mockRejectedValue(originalError);
          processorSink = createProcessorSink(processor, nextSink);

          const expectedRejects = expect(processorSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'processor',
                  id: processorSink.id,
                },
              ],
            },
            cause: originalError,
          });

          expect(processor.process).toHaveBeenCalledWith(testEntry);
          expect(nextSink.emit).not.toHaveBeenCalled();
        });
      });

      describe('from next sink', () => {
        it('should wrap next sink errors in LoggerSinkError', async () => {
          const originalEntry: LogEntry = {
            level: LogLevel.WARN,
            message: 'warning message',
            timestamp: new Date(),
            serviceName: 'testService',
          };

          const processedEntry: LogEntry = {
            level: LogLevel.WARN,
            message: 'processed warning',
            timestamp: new Date(),
            serviceName: 'testService',
          };

          const originalError = new Error('next sink failed');
          processor.process.mockResolvedValue(processedEntry);
          nextSink.emit.mockRejectedValue(originalError);
          processorSink = createProcessorSink(processor, nextSink);

          const expectedRejects = expect(
            processorSink.emit(originalEntry),
          ).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'processor',
                  id: processorSink.id,
                },
              ],
            },
            cause: originalError,
          });

          expect(processor.process).toHaveBeenCalledWith(originalEntry);
          expect(nextSink.emit).toHaveBeenCalledWith(processedEntry);
        });
      });

      describe('when handling nested LoggerSinkError', () => {
        it('should combine error stacks from next sink nested error', async () => {
          const originalEntry: LogEntry = {
            level: LogLevel.ERROR,
            message: 'error message',
            timestamp: new Date(),
            serviceName: 'testService',
          };

          const processedEntry: LogEntry = {
            level: LogLevel.ERROR,
            message: 'processed error',
            timestamp: new Date(),
            serviceName: 'testService',
          };

          const rootError = new Error('nested sink error');
          const nestedError = new LoggerSinkError(
            [{ type: 'nested', id: nextSink.id }],
            rootError,
          );

          processor.process.mockResolvedValue(processedEntry);
          nextSink.emit.mockRejectedValue(nestedError);
          processorSink = createProcessorSink(processor, nextSink);

          const expectedRejects = expect(
            processorSink.emit(originalEntry),
          ).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'nested',
                  id: nextSink.id,
                },
                {
                  type: 'processor',
                  id: processorSink.id,
                },
              ],
            },
            cause: rootError,
          });

          expect(processor.process).toHaveBeenCalledWith(originalEntry);
          expect(nextSink.emit).toHaveBeenCalledWith(processedEntry);
        });
      });
    });
  });
});
