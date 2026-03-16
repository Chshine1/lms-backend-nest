import { MulticastSink } from './multicast.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

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

    it('should handle multiple failures', async () => {
      sink1.emit.mockRejectedValue(new Error('sink1 failed'));
      sink3.emit.mockRejectedValue(new Error('sink3 failed'));
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

    it('should work with empty sinks array', async () => {
      const multicastSink: Sink = new MulticastSink('multicast-1', []);

      await expect(multicastSink.emit(testEntry)).resolves.toBeUndefined();
    });
  });
});
