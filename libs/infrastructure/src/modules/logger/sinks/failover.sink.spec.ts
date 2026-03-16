import { FailoverSink } from './failover.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

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

    it('should throw LoggerSinkError when all sinks fail', async () => {
      const primaryError = new Error('primary failed');
      const fallback1Error = new Error('fallback1 failed');
      const fallback2Error = new Error('fallback2 failed');

      primarySink.emit.mockRejectedValue(primaryError);
      fallbackSink1.emit.mockRejectedValue(fallback1Error);
      fallbackSink2.emit.mockRejectedValue(fallback2Error);

      failoverSink = new FailoverSink('failover-1', primarySink, [
        fallbackSink1,
        fallbackSink2,
      ]);

      await expect(failoverSink.emit(testEntry)).rejects.toThrow(
        LoggerSinkError,
      );
      const error = await failoverSink.emit(testEntry).catch((e) => e);

      expect(error.message).toBe('Logging pipeline breaks due to sink errors');
      expect(error.context?.sinkErrorStack).toHaveLength(1);
      expect(error.context?.sinkErrorStack[0]).toMatchObject({
        type: 'failover',
        id: 'failover-1',
        details: {
          allFailed: true,
          errorSinks: expect.arrayContaining([
            expect.objectContaining({ type: 'primary', id: 'primary-sink-1' }),
            expect.objectContaining({ type: 'fallback', id: 'fallback-1' }),
            expect.objectContaining({ type: 'fallback', id: 'fallback-2' }),
          ]),
        },
      });

      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink2.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should work with empty fallbacks array and throw LoggerSinkError', async () => {
      const primaryError = new Error('primary failed');
      primarySink.emit.mockRejectedValue(primaryError);
      failoverSink = new FailoverSink('failover-1', primarySink, []);

      await expect(failoverSink.emit(testEntry)).rejects.toThrow(
        LoggerSinkError,
      );
      const error = await failoverSink.emit(testEntry).catch((e) => e);

      expect(error.message).toBe('Logging pipeline breaks due to sink errors');
      expect(error.context?.sinkErrorStack[0].details.allFailed).toBe(true);
      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should handle nested LoggerSinkError from fallback sinks', async () => {
      const primaryError = new Error('primary failed');
      const nestedError = new LoggerSinkError(
        [{ type: 'nested', id: 'nested-sink' }],
        new Error('nested sink error'),
      );

      primarySink.emit.mockRejectedValue(primaryError);
      fallbackSink1.emit.mockRejectedValue(nestedError);

      failoverSink = new FailoverSink('failover-1', primarySink, [
        fallbackSink1,
        fallbackSink2,
      ]);

      await expect(failoverSink.emit(testEntry)).rejects.toThrow(
        LoggerSinkError,
      );
      const error = await failoverSink.emit(testEntry).catch((e) => e);

      expect(error.context?.sinkErrorStack).toHaveLength(2);
      expect(error.context?.sinkErrorStack[0]).toMatchObject({
        type: 'nested',
        id: 'nested-sink',
      });
      expect(error.context?.sinkErrorStack[1]).toMatchObject({
        type: 'failover',
        id: 'failover-1',
      });
    });

    it('should handle partial success with some fallback sinks failing', async () => {
      const primaryError = new Error('primary failed');
      const fallback1Error = new Error('fallback1 failed');

      primarySink.emit.mockRejectedValue(primaryError);
      fallbackSink1.emit.mockRejectedValue(fallback1Error);

      failoverSink = new FailoverSink('failover-1', primarySink, [
        fallbackSink1,
        fallbackSink2,
      ]);

      await failoverSink.emit(testEntry);

      expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
      expect(fallbackSink2.emit).toHaveBeenCalledWith(testEntry);
    });
  });
});
