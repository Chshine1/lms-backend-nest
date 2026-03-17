import { FilterSink } from './filter.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import {
  Filter,
  Sink,
} from '@app/infrastructure/modules/logger/contracts/middlewares.interface';
import { LoggerSinkError } from '@app/infrastructure/modules/logger/errors/logger-sink.error';

describe('FilterSink', () => {
  let filter: jest.Mocked<Filter>;
  let nextSink: jest.Mocked<Sink>;
  let filterSink: Sink;
  let testEntry: LogEntry;

  beforeEach(() => {
    filter = { filter: jest.fn() };
    nextSink = {
      id: 'next-sink-1',
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
    it('should pass entry to next sink when filter returns true', async () => {
      filter.filter.mockReturnValue(true);
      filterSink = new FilterSink('filter-1', filter, nextSink);

      await filterSink.emit(testEntry);

      expect(filter.filter).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should not pass entry to next sink when filter returns false', async () => {
      filter.filter.mockReturnValue(false);
      filterSink = new FilterSink('filter-1', filter, nextSink);

      await filterSink.emit(testEntry);

      expect(filter.filter).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).not.toHaveBeenCalled();
    });

    it('should handle errors from next sink and wrap them in LoggerSinkError', async () => {
      filter.filter.mockReturnValue(true);
      const originalError = new Error('next sink error');
      nextSink.emit.mockRejectedValue(originalError);
      filterSink = new FilterSink('filter-1', filter, nextSink);

      const expectedRejects = expect(filterSink.emit(testEntry)).rejects;

      await expectedRejects.toThrow(LoggerSinkError);
      await expectedRejects.toMatchObject({
        message: 'Logging pipeline breaks due to sink errors',
        cause: originalError,
      });

      expect(filter.filter).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(testEntry);
    });

    it('should handle filter throwing an error', async () => {
      filter.filter.mockImplementation(() => {
        throw new Error('filter error');
      });
      filterSink = new FilterSink('filter-1', filter, nextSink);

      const expectedRejects = expect(filterSink.emit(testEntry)).rejects;

      await expectedRejects.toThrow(LoggerSinkError);
      await expectedRejects.toMatchObject({
        message: 'Logging pipeline breaks due to sink errors',
        cause: new Error('filter error'),
      });

      expect(nextSink.emit).not.toHaveBeenCalled();
    });

    it('should handle nested LoggerSinkError from next sink', async () => {
      filter.filter.mockReturnValue(true);
      const nestedError = new LoggerSinkError(
        [{ type: 'nested', id: 'nested-sink' }],
        new Error('nested sink error'),
      );
      nextSink.emit.mockRejectedValue(nestedError);
      filterSink = new FilterSink('filter-1', filter, nextSink);

      const expectedRejects = expect(filterSink.emit(testEntry)).rejects;

      await expectedRejects.toThrow(LoggerSinkError);
      await expectedRejects.toMatchObject({
        context: {
          sinkErrorStack: [
            {
              type: 'nested',
              id: 'nested-sink',
            },
            {
              type: 'filter',
              id: 'filter-1',
            },
          ],
        },
      });

      expect(filter.filter).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(testEntry);
    });
  });
});
