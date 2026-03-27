import { FilterSink } from './filter.sink';
import { LogEntry } from '../contracts/log.entry';
import { Filter, Sink } from '../contracts/middlewares.interface';
import { LoggerSinkError } from '../errors/index';
import { LogLevel } from '@app/contracts';

describe('FilterSink', () => {
  let filter: jest.Mocked<Filter>;
  let nextSink: jest.Mocked<Sink>;
  let filterSink: Sink;
  let testEntry: LogEntry;

  function createMockSink(id: string): jest.Mocked<Sink> {
    return {
      id,
      emit: jest.fn().mockResolvedValue(undefined),
    };
  }

  function createFilterSink(filter: Filter, nextSink: Sink): FilterSink {
    return new FilterSink('filter-1', filter, nextSink);
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
    filter = { filter: jest.fn() };
    nextSink = createMockSink('next-sink-1');
    testEntry = createTestEntry();
  });

  describe('emit', () => {
    describe('when filter returns true', () => {
      it('should pass entry to next sink', async () => {
        filter.filter.mockReturnValue(true);
        filterSink = createFilterSink(filter, nextSink);

        await filterSink.emit(testEntry);

        expect(filter.filter).toHaveBeenCalledWith(testEntry);
        expect(nextSink.emit).toHaveBeenCalledWith(testEntry);
      });
    });

    describe('when filter returns false', () => {
      it('should not pass entry to next sink', async () => {
        filter.filter.mockReturnValue(false);
        filterSink = createFilterSink(filter, nextSink);

        await filterSink.emit(testEntry);

        expect(filter.filter).toHaveBeenCalledWith(testEntry);
        expect(nextSink.emit).not.toHaveBeenCalled();
      });
    });

    describe('when handling errors', () => {
      describe('from next sink', () => {
        it('should wrap next sink errors in LoggerSinkError', async () => {
          filter.filter.mockReturnValue(true);
          const originalError = new Error('next sink error');
          nextSink.emit.mockRejectedValue(originalError);
          filterSink = createFilterSink(filter, nextSink);

          const expectedRejects = expect(filterSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'filter',
                  id: filterSink.id,
                },
              ],
            },
            cause: originalError,
          });

          expect(filter.filter).toHaveBeenCalledWith(testEntry);
          expect(nextSink.emit).toHaveBeenCalledWith(testEntry);
        });
      });

      describe('from filter', () => {
        it('should wrap filter errors in LoggerSinkError', async () => {
          const originalError = new Error('filter error');
          filter.filter.mockImplementation(() => {
            throw originalError;
          });
          filterSink = createFilterSink(filter, nextSink);

          const expectedRejects = expect(filterSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'filter',
                  id: filterSink.id,
                },
              ],
            },
            cause: originalError,
          });

          expect(nextSink.emit).not.toHaveBeenCalled();
        });
      });

      describe('when handling nested LoggerSinkError', () => {
        it('should combine error stacks from next sink nested error', async () => {
          filter.filter.mockReturnValue(true);
          const rootError = new Error('nested sink error');
          const nestedError = new LoggerSinkError(
            [{ type: 'nested', id: nextSink.id }],
            rootError,
          );
          nextSink.emit.mockRejectedValue(nestedError);
          filterSink = createFilterSink(filter, nextSink);

          const expectedRejects = expect(filterSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'nested',
                  id: nextSink.id,
                },
                {
                  type: 'filter',
                  id: filterSink.id,
                },
              ],
            },
            cause: rootError,
          });

          expect(filter.filter).toHaveBeenCalledWith(testEntry);
          expect(nextSink.emit).toHaveBeenCalledWith(testEntry);
        });
      });
    });
  });
});
