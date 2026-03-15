import { LoggerService, LogParams } from './logger.service';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { LogBuffer } from '@app/infrastructure/modules/logger/buffer/buffer.interface';

class MockSink implements Sink {
  emittedEntries: LogEntry[] = [];

  emit(entry: LogEntry): Promise<void> {
    this.emittedEntries.push(entry);
    return Promise.resolve();
  }
}

class MockBuffer implements LogBuffer {
  entries: LogEntry[] = [];
  writeCalled = false;
  flushCalled = false;

  write(entry: LogEntry): boolean {
    this.writeCalled = true;
    this.entries.push(entry);
    return true; // Always accept entries
  }

  async flush(sink: Sink): Promise<void> {
    this.flushCalled = true;
    for (const entry of this.entries) {
      await sink.emit(entry);
    }
    this.entries = [];
  }

  clear(): void {
    throw new Error('Method not implemented.');
  }
  size(): number {
    throw new Error('Method not implemented.');
  }
  getEntries(): LogEntry[] {
    throw new Error('Method not implemented.');
  }
}

class MockEnrichmentService {
  enrich(params: LogParams): Promise<LogEntry> {
    return Promise.resolve({
      ...params,
      timestamp: new Date(),
    } as LogEntry);
  }
}

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockSink: MockSink;
  let mockBuffer: MockBuffer;
  let mockEnrichmentService: MockEnrichmentService;

  beforeEach(() => {
    mockSink = new MockSink();
    mockBuffer = new MockBuffer();
    mockEnrichmentService = new MockEnrichmentService();

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

      expect(mockBuffer.writeCalled).toBe(true);
      expect(mockBuffer.entries).toHaveLength(1);

      const entry = mockBuffer.entries[0];
      expect(entry).toBeDefined();

      expect(entry?.level).toBe('info');
      expect(entry?.message).toBe('Test message');
      expect((entry?.context || {})['userId']).toBe(123);
      expect(entry?.timestamp).toBeDefined();
    });

    it('should emit directly to sink when buffer rejects entry', async () => {
      // Create a buffer that rejects entries
      class RejectingBuffer implements LogBuffer {
        write: (entry: LogEntry) => boolean = jest.fn().mockReturnValue(false);
        flush: () => Promise<void> = jest.fn();

        clear(): void {}
        getEntries(): LogEntry[] {
          return [];
        }
        size(): number {
          return 0;
        }
      }
      const rejectingBuffer = new RejectingBuffer();

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

      expect(rejectingBuffer.write).toHaveBeenCalled();
      expect(mockSink.emittedEntries).toHaveLength(1);
      expect(mockSink.emittedEntries[0]?.message).toBe('Direct emit test');
    });

    it('should handle log entries with error objects', async () => {
      const testError = new Error('Test error');

      await loggerService.log({
        level: LogLevel.ERROR,
        message: 'Error occurred',
        error: testError,
      });

      expect(mockBuffer.entries).toHaveLength(1);
      expect(mockBuffer.entries[0]?.error).toBe(testError);
    });
  });

  describe('flush', () => {
    it('should flush buffer to sink', async () => {
      // Add some entries to buffer
      await loggerService.log({ level: LogLevel.INFO, message: 'Message 1' });
      await loggerService.log({ level: LogLevel.INFO, message: 'Message 2' });

      expect(mockBuffer.entries).toHaveLength(2);

      await loggerService.flush();

      expect(mockBuffer.flushCalled).toBe(true);
      expect(mockBuffer.entries).toHaveLength(0);
      expect(mockSink.emittedEntries).toHaveLength(2);
    });
  });
});
