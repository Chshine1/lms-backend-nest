import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { NullSink } from '@app/infrastructure/modules/logger/sinks/null.sink';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

describe('NullSink', () => {
  let nullSink: Sink;
  let testEntry: LogEntry;

  function createNullSink(): NullSink {
    return new NullSink('null-1');
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
    testEntry = createTestEntry();
  });

  describe('emit', () => {
    it('should result in nothing', async () => {
      nullSink = createNullSink();
      await nullSink.emit(testEntry);
    });
  });
});
