import { FailoverSink } from './failover.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

describe('FailoverSink', () => {
  let primarySink: jest.Mocked<Sink>;
  let fallbackSink1: jest.Mocked<Sink>;
  let fallbackSink2: jest.Mocked<Sink>;
  let failoverSink: Sink;
  let testEntry: LogEntry;

  beforeEach(() => {
    primarySink = {
      id: 'primary-sink-1',
      emit: jest.fn().mockResolvedValue(undefined),
    };
    fallbackSink1 = {
      id: 'fallback-1',
      emit: jest.fn().mockResolvedValue(undefined),
    };
    fallbackSink2 = {
      id: 'fallback-2',
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
    it('should use primary sink when it succeeds', async () => {
      failoverSink = new FailoverSink('failover-1', primarySink, [
        fallbackSink1,
        fallbackSink2,
      ]);

      await failoverSink.emit(testEntry);

      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink1.emit).not.toHaveBeenCalled();
      expect(fallbackSink2.emit).not.toHaveBeenCalled();
    });

    it('should fallback to first available sink when primary fails', async () => {
      primarySink.emit.mockRejectedValue(new Error('primary failed'));
      failoverSink = new FailoverSink('failover-1', primarySink, [
        fallbackSink1,
        fallbackSink2,
      ]);

      await failoverSink.emit(testEntry);

      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink2.emit).not.toHaveBeenCalled();
    });

    it('should fallback to second sink when first fallback fails', async () => {
      primarySink.emit.mockRejectedValue(new Error('primary failed'));
      fallbackSink1.emit.mockRejectedValue(new Error('fallback1 failed'));
      failoverSink = new FailoverSink('failover-1', primarySink, [
        fallbackSink1,
        fallbackSink2,
      ]);

      await failoverSink.emit(testEntry);

      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink2.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should throw error when all sinks fail', async () => {
      primarySink.emit.mockRejectedValue(new Error('primary failed'));
      fallbackSink1.emit.mockRejectedValue(new Error('fallback1 failed'));
      fallbackSink2.emit.mockRejectedValue(new Error('fallback2 failed'));
      failoverSink = new FailoverSink('failover-1', primarySink, [
        fallbackSink1,
        fallbackSink2,
      ]);

      await expect(failoverSink.emit(testEntry)).rejects.toThrow(
        'All sinks failed for log entry',
      );

      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink2.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should work with empty fallbacks array', async () => {
      primarySink.emit.mockRejectedValue(new Error('primary failed'));
      failoverSink = new FailoverSink('failover-1', primarySink, []);

      await expect(failoverSink.emit(testEntry)).rejects.toThrow(
        'All sinks failed for log entry',
      );
      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
    });
  });
});
