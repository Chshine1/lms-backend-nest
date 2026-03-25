import { LogEntry } from '../contracts/log.entry';
import { NullSink } from './null.sink';
import { Sink } from '../contracts/middlewares.interface';
import { LogLevel } from '@app/contracts';

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
