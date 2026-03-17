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
  let testEntry: LogEntry;

  beforeEach(() => {
    sink1 = {
      id: 'sink-1',
      emit: jest.fn().mockResolvedValue(undefined),
    };
    sink2 = {
      id: 'sink-2',
      emit: jest.fn().mockResolvedValue(undefined),
    };
    sink3 = {
      id: 'sink-3',
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
    it('should emit to all sinks when all succeed', async () => {
      const multicastSink: Sink = new MulticastSink('multicast-1', [
        sink1,
        sink2,
        sink3,
      ]);

      await multicastSink.emit(testEntry);

      expect(sink1.emit).toHaveBeenCalledWith(testEntry);
      expect(sink2.emit).toHaveBeenCalledWith(testEntry);
      expect(sink3.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should handle multiple failures and throw LoggerSinkError', async () => {
      const sink1Error = new Error('sink1 failed');
      const sink3Error = new Error('sink3 failed');

      sink1.emit.mockRejectedValue(sink1Error);
      sink3.emit.mockRejectedValue(sink3Error);

      const multicastSink: Sink = new MulticastSink('multicast-1', [
        sink1,
        sink2,
        sink3,
      ]);

      const expectedRejects = expect(multicastSink.emit(testEntry)).rejects;

      await expectedRejects.toThrow(LoggerSinkError);
      await expectedRejects.toMatchObject({
        message: 'Logging pipeline breaks due to sink errors',
        context: {
          sinkErrorStack: [
            {
              type: 'multicast',
              id: 'multicast-1',
              details: {
                errorSinks: [
                  {
                    id: 'sink-1',
                    message: 'sink1 failed',
                  },
                  {
                    id: 'sink-3',
                    message: 'sink3 failed',
                  },
                ],
              },
            },
          ],
        },
      });

      expect(sink1.emit).toHaveBeenCalledWith(testEntry);
      expect(sink2.emit).toHaveBeenCalledWith(testEntry);
      expect(sink3.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should work with empty sinks array', async () => {
      const multicastSink: Sink = new MulticastSink('multicast-1', []);

      await expect(multicastSink.emit(testEntry)).resolves.toBeUndefined();
    });

    it('should handle all sinks failing', async () => {
      const sink1Error = new Error('sink1 failed');
      const sink2Error = new Error('sink2 failed');
      const sink3Error = new Error('sink3 failed');

      sink1.emit.mockRejectedValue(sink1Error);
      sink2.emit.mockRejectedValue(sink2Error);
      sink3.emit.mockRejectedValue(sink3Error);

      const multicastSink: Sink = new MulticastSink('multicast-1', [
        sink1,
        sink2,
        sink3,
      ]);

      const expectedRejects = expect(multicastSink.emit(testEntry)).rejects;

      await expectedRejects.toThrow(LoggerSinkError);
      await expectedRejects.toMatchObject({
        context: {
          sinkErrorStack: [
            {
              details: {
                errorSinks: [
                  { id: 'sink-1', message: 'sink1 failed' },
                  { id: 'sink-2', message: 'sink2 failed' },
                  { id: 'sink-3', message: 'sink3 failed' },
                ],
              },
            },
          ],
        },
      });

      expect(sink1.emit).toHaveBeenCalledWith(testEntry);
      expect(sink2.emit).toHaveBeenCalledWith(testEntry);
      expect(sink3.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should handle nested LoggerSinkError from sinks', async () => {
      const nestedError = new LoggerSinkError(
        [{ type: 'nested', id: 'nested-sink' }],
        new Error('nested sink error'),
      );

      sink1.emit.mockRejectedValue(nestedError);
      sink2.emit.mockRejectedValue(new Error('sink2 failed'));

      const multicastSink: Sink = new MulticastSink('multicast-1', [
        sink1,
        sink2,
        sink3,
      ]);

      const expectedRejects = expect(multicastSink.emit(testEntry)).rejects;

      await expectedRejects.toThrow(LoggerSinkError);
      await expectedRejects.toMatchObject({
        context: {
          sinkErrorStack: [
            {
              type: 'nested',
              id: 'nested-sink',
            },
            {
              type: 'multicast',
              id: 'multicast-1',
            },
          ],
        },
      });
    });
  });
});
