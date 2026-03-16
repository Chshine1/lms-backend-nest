import { FilterSink } from './filter.sink';
import {
  LogEntry,
  LogLevel,
} from '@app/infrastructure/modules/logger/contracts/log.entry';
import {
  Filter,
  Sink,
} from '@app/infrastructure/modules/logger/contracts/middlewares.interface';

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

    it('should handle errors from next sink', async () => {
      filter.filter.mockReturnValue(true);
      nextSink.emit.mockRejectedValue(new Error('next sink error'));
      filterSink = new FilterSink('filter-1', filter, nextSink);

      await expect(filterSink.emit(testEntry)).rejects.toThrow(
        'next sink error',
      );
      expect(filter.filter).toHaveBeenCalledWith(testEntry);
      expect(nextSink.emit).toHaveBeenCalledWith(testEntry);
    });
  });
});
