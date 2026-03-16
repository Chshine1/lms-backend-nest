import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import { NullSink } from '@app/infrastructure/modules/logger/sinks/null.sink';
import { Sink } from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

describe('NullSink', () => {
  let nullSink: Sink;
  let testEntry: LogEntry;

  beforeEach(() => {
    testEntry = {
      level: LogLevel.INFO,
      message: 'test message',
      timestamp: new Date(),
      serviceName: 'testService',
    };
  });

  describe('emit', () => {
    it('should result in nothing', async () => {
      nullSink = new NullSink('null-1');
      await nullSink.emit(testEntry);
    });
  });
});
