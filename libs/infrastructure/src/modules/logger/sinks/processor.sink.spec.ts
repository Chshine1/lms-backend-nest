import { ProcessorSink } from './processor.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import {
  Processor,
  Sink,
} from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

describe('TransformSink', () => {
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

    it('should handle processor errors', async () => {
      processor.process.mockRejectedValue(new Error('processor failed'));
      processorSink = new ProcessorSink('processor-1', processor, nextSink);

      await expect(processorSink.emit(testEntry)).rejects.toThrow(
        'processor failed',
      );

      expect(processor.process).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).not.toHaveBeenCalled();
    });

    it('should handle next sink errors', async () => {
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

      processor.process.mockResolvedValue(processedEntry);
      nextSink.emit.mockRejectedValue(new Error('next sink failed'));
      processorSink = new ProcessorSink('processor-1', processor, nextSink);

      await expect(processorSink.emit(originalEntry)).rejects.toThrow(
        'next sink failed',
      );

      expect(processor.process).toHaveBeenCalledWith(originalEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(processedEntry);
    });
  });
});
