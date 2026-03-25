import { LoggerService, LogParams } from './logger.service';
import { Sink } from './contracts/middlewares.interface';
import { LogEntry, LogLevel } from './contracts/log.entry';
import { BaseError } from '@app/contracts/errors/base-error';
import { ErrorCode } from '@app/contracts/errors/error.codes';
import { LogBuffer } from './contracts/buffer.interface';

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockSink: jest.Mocked<Sink>;
  let mockBuffer: jest.Mocked<LogBuffer>;
  let mockEnrichmentService: { enrich: jest.Mock };
  let bufferEntries: LogEntry[];

  beforeEach(() => {
    jest.clearAllMocks();

    mockSink = {
      id: 'test',
      emit: jest.fn().mockResolvedValue(undefined),
    };

    bufferEntries = [];
    mockBuffer = {
      write: jest.fn((entry: LogEntry) => {
        bufferEntries.push(entry);
        return true;
      }),
      flush: jest.fn(async (sink: Sink) => {
        for (const entry of bufferEntries) {
          await sink.emit(entry);
        }
        bufferEntries = [];
      }),
    };

    mockEnrichmentService = {
      enrich: jest.fn().mockImplementation((params: LogParams) =>
        Promise.resolve({
          ...params,
          timestamp: new Date(),
        } as LogEntry),
      ),
    };

    loggerService = new LoggerService({
      sink: mockSink,
      buffer: mockBuffer,
      enrichmentService: mockEnrichmentService,
    });
  });

  describe('log', () => {
    it('should enrich log entry and write to buffer', async () => {
      const logParams = {
        level: LogLevel.INFO,
        message: 'Test message',
        context: { userId: 123 },
      };

      await loggerService.log(logParams);

      expect(mockBuffer.write).toHaveBeenCalledTimes(1);
      const entry = mockBuffer.write.mock.calls[0]![0];
      expect(entry.level).toBe('info');
      expect(entry.message).toBe('Test message');
      expect(entry.context?.['userId']).toBe(123);
      expect(entry.timestamp).toBeDefined();
    });

    it('should emit directly to sink when buffer rejects entry', async () => {
      const rejectingBuffer = {
        write: jest.fn().mockReturnValue(false),
        flush: jest.fn(),
      } as jest.Mocked<LogBuffer>;

      const testLogger = new LoggerService({
        sink: mockSink,
        buffer: rejectingBuffer,
        enrichmentService: mockEnrichmentService,
      });

      const logParams = {
        level: LogLevel.INFO,
        message: 'Direct emit test',
      };

      await testLogger.log(logParams);

      expect(rejectingBuffer.write).toHaveBeenCalledTimes(1);
      expect(mockSink.emit).toHaveBeenCalledTimes(1);
      expect(mockSink.emit.mock.calls[0]![0].message).toBe('Direct emit test');
    });

    it('should handle log entries with error objects', async () => {
      class TestError extends BaseError {
        constructor() {
          super('Test error', ErrorCode.UNKNOWN, {});
        }
      }
      const testError = new TestError();

      await loggerService.log({
        level: LogLevel.ERROR,
        message: 'Error occurred',
        error: testError,
      });

      expect(mockBuffer.write).toHaveBeenCalledTimes(1);
      const entry = mockBuffer.write.mock.calls[0]![0];
      expect(entry.error).toBe(testError);
    });
  });

  describe('flush', () => {
    it('should flush buffer to sink', async () => {
      await loggerService.log({ level: LogLevel.INFO, message: 'Message 1' });
      await loggerService.log({ level: LogLevel.INFO, message: 'Message 2' });

      expect(mockBuffer.write).toHaveBeenCalledTimes(2);

      await loggerService.flush();

      expect(mockBuffer.flush).toHaveBeenCalledTimes(1);
      expect(mockSink.emit).toHaveBeenCalledTimes(2);
      expect(mockSink.emit.mock.calls[0]![0].message).toBe('Message 1');
      expect(mockSink.emit.mock.calls[1]![0].message).toBe('Message 2');
    });
  });
});
