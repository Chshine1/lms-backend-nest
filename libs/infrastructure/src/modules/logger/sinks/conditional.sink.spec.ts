import { ConditionalSink } from './conditional.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

describe('ConditionalSink', () => {
  let trueSink: jest.Mocked<Sink>;
  let falseSink: jest.Mocked<Sink>;
  let conditionalSink: Sink;
  let testEntry: LogEntry;

  beforeEach(() => {
    trueSink = {
      id: 'true-sink-1',
      emit: jest.fn().mockResolvedValue(undefined),
    };
    falseSink = {
      id: 'false-sink-1',
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
    it('should route to trueSink when predicate returns true', async () => {
      const predicate = jest.fn().mockReturnValue(true);
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      await conditionalSink.emit(testEntry);

      expect(predicate).toHaveBeenCalledWith(testEntry);
      expect(trueSink.emit).toHaveBeenCalledWith(testEntry);
      expect(falseSink.emit).not.toHaveBeenCalled();
    });

    it('should route to falseSink when predicate returns false', async () => {
      const predicate = jest.fn().mockReturnValue(false);
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      await conditionalSink.emit(testEntry);

      expect(predicate).toHaveBeenCalledWith(testEntry);
      expect(falseSink.emit).toHaveBeenCalledWith(testEntry);
      expect(trueSink.emit).not.toHaveBeenCalled();
    });

    it('should handle errors from trueSink', async () => {
      const predicate = jest.fn().mockReturnValue(true);
      trueSink.emit.mockRejectedValue(new Error('true sink error'));
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      await expect(conditionalSink.emit(testEntry)).rejects.toThrow(
        'true sink error',
      );
    });

    it('should handle errors from falseSink', async () => {
      const predicate = jest.fn().mockReturnValue(false);
      falseSink.emit.mockRejectedValue(new Error('false sink error'));
      conditionalSink = new ConditionalSink(
        'conditional-1',
        predicate,
        trueSink,
        falseSink,
      );

      await expect(conditionalSink.emit(testEntry)).rejects.toThrow(
        'false sink error',
      );
    });
  });
});
