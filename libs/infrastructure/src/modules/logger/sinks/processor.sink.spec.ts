import { ProcessorSink } from './processor.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import {
  Processor,
  Sink,
} from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

describe('ProcessorSink', () => {
  let processor: jest.Mocked<Processor>;
  let nextSink: jest.Mocked<Sink>;
  let processorSink: Sink;
  let testEntry: LogEntry;

  beforeEach(() => {
    processor = { process: jest.fn() };
    nextSink = {
      id: 'next-sink-1',
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
      processorSink = new ProcessorSink('processor-1', processor, nextSink);

      await processorSink.emit(originalEntry);

      expect(processor.process).toHaveBeenCalledWith(originalEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(processedEntry);
    });

    it('should handle processor errors and wrap them in LoggerSinkError', async () => {
      const originalError = new Error('processor failed');
      processor.process.mockRejectedValue(originalError);
      processorSink = new ProcessorSink('processor-1', processor, nextSink);

      await expect(processorSink.emit(testEntry)).rejects.toThrow(
        LoggerSinkError,
      );
      await expect(processorSink.emit(testEntry)).rejects.toMatchObject({
        message: 'Logging pipeline breaks due to sink errors',
        cause: originalError,
      });

      expect(processor.process).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).not.toHaveBeenCalled();
    });

    it('should handle next sink errors and wrap them in LoggerSinkError', async () => {
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
      processorSink = new ProcessorSink('processor-1', processor, nextSink);

      await expect(processorSink.emit(originalEntry)).rejects.toThrow(
        LoggerSinkError,
      );
      await expect(processorSink.emit(originalEntry)).rejects.toMatchObject({
        message: 'Logging pipeline breaks due to sink errors',
        cause: originalError,
      });

      expect(processor.process).toHaveBeenCalledWith(originalEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(processedEntry);
    });

    it('should handle processor throwing an error', async () => {
      processor.process.mockImplementation(() => {
        throw new Error('processor sync error');
      });
      processorSink = new ProcessorSink('processor-1', processor, nextSink);

      await expect(processorSink.emit(testEntry)).rejects.toThrow(
        LoggerSinkError,
      );
      await expect(processorSink.emit(testEntry)).rejects.toMatchObject({
        message: 'Logging pipeline breaks due to sink errors',
        cause: new Error('processor sync error'),
      });

      expect(processor.process).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).not.toHaveBeenCalled();
    });

    it('should handle nested LoggerSinkError from next sink', async () => {
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

      const nestedError = new LoggerSinkError(
        [{ type: 'nested', id: 'nested-sink' }],
        new Error('nested sink error'),
      );

      processor.process.mockResolvedValue(processedEntry);
      nextSink.emit.mockRejectedValue(nestedError);
      processorSink = new ProcessorSink('processor-1', processor, nextSink);

      await expect(processorSink.emit(originalEntry)).rejects.toThrow(
        LoggerSinkError,
      );
      const error = await processorSink.emit(originalEntry).catch((e) => e);

      expect(error.context?.sinkErrorStack).toHaveLength(2);
      expect(error.context?.sinkErrorStack[0]).toMatchObject({
        type: 'nested',
        id: 'nested-sink',
      });
      expect(error.context?.sinkErrorStack[1]).toMatchObject({
        type: 'processor',
        id: 'processor-1',
      });

      expect(processor.process).toHaveBeenCalledWith(originalEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(processedEntry);
    });
  });
});
