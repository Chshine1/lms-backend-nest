import { FailoverSink } from './failover.sink';
import { LogEntry } from '../contracts/log.entry';
import { Sink } from '../contracts/middlewares.interface';
import { LoggerSinkError } from '../errors';
import { LogLevel } from '@app/contracts';

describe('FailoverSink', () => {
  let primarySink: jest.Mocked<Sink>;
  let fallbackSink1: jest.Mocked<Sink>;
  let fallbackSink2: jest.Mocked<Sink>;
  let failoverSink: Sink;
  let testEntry: LogEntry;

  function createMockSink(id: string): jest.Mocked<Sink> {
    return {
      id,
      emit: jest.fn().mockResolvedValue(undefined),
    };
  }

  function createFailoverSink(primary: Sink, fallbacks: Sink[]): FailoverSink {
    return new FailoverSink('failover-1', primary, fallbacks);
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
    primarySink = createMockSink('primary-sink-1');
    fallbackSink1 = createMockSink('fallback-1');
    fallbackSink2 = createMockSink('fallback-2');
    testEntry = createTestEntry();
  });

  describe('emit', () => {
    describe('when primary sink succeeds', () => {
      it('should use primary sink and not call fallback sinks', async () => {
        failoverSink = createFailoverSink(primarySink, [
          fallbackSink1,
          fallbackSink2,
        ]);

        await failoverSink.emit(testEntry);

        expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
        expect(fallbackSink1.emit).not.toHaveBeenCalled();
        expect(fallbackSink2.emit).not.toHaveBeenCalled();
      });
    });

    describe('when primary sink fails', () => {
      let primaryError: Error;
      beforeEach(() => {
        primaryError = new Error('primary failed');
        primarySink.emit.mockRejectedValue(primaryError);
      });

      describe('and first fallback sink succeeds', () => {
        it('should call primary sink and first fallback sink', async () => {
          failoverSink = createFailoverSink(primarySink, [
            fallbackSink1,
            fallbackSink2,
          ]);

          const expectedRejects = expect(failoverSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            message: 'Logging pipeline breaks due to sink errors',
            context: {
              sinkErrorStack: [
                {
                  type: 'failover',
                  id: failoverSink.id,
                  details: {
                    allFailed: false,
                    errorSinks: [
                      {
                        type: 'primary',
                        id: primarySink.id,
                      },
                    ],
                  },
                },
              ],
            },
            cause: expect.objectContaining({
              errors: [primaryError],
            }) as AggregateError,
          });

          expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
          expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
          expect(fallbackSink2.emit).not.toHaveBeenCalled();
        });
      });

      describe('and first fallback sink fails', () => {
        let fallbackError1: Error;
        beforeEach(() => {
          fallbackError1 = new Error('fallback1 failed');
          fallbackSink1.emit.mockRejectedValue(fallbackError1);
        });

        describe('and second fallback sink succeeds', () => {
          it('should call primary sink, first fallback sink, and second fallback sink', async () => {
            failoverSink = createFailoverSink(primarySink, [
              fallbackSink1,
              fallbackSink2,
            ]);

            const expectedRejects = expect(
              failoverSink.emit(testEntry),
            ).rejects;

            await expectedRejects.toThrow(LoggerSinkError);
            await expectedRejects.toMatchObject({
              message: 'Logging pipeline breaks due to sink errors',
              context: {
                sinkErrorStack: [
                  {
                    type: 'failover',
                    id: failoverSink.id,
                    details: {
                      allFailed: false,
                      errorSinks: [
                        {
                          type: 'primary',
                          id: primarySink.id,
                        },
                        {
                          type: 'fallback',
                          id: fallbackSink1.id,
                        },
                      ],
                    },
                  },
                ],
              },
              cause: expect.objectContaining({
                errors: [primaryError, fallbackError1],
              }) as AggregateError,
            });

            expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
            expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
            expect(fallbackSink2.emit).toHaveBeenCalledWith(testEntry);
          });
        });

        describe('and all fallback sinks fail', () => {
          let fallbackError2: Error;
          beforeEach(() => {
            fallbackError2 = new Error('fallback2 failed');
            fallbackSink2.emit.mockRejectedValue(fallbackError2);
          });

          it('should throw LoggerSinkError with complete error context', async () => {
            failoverSink = createFailoverSink(primarySink, [
              fallbackSink1,
              fallbackSink2,
            ]);

            const expectedRejects = expect(
              failoverSink.emit(testEntry),
            ).rejects;

            await expectedRejects.toThrow(LoggerSinkError);
            await expectedRejects.toMatchObject({
              message: 'Logging pipeline breaks due to sink errors',
              context: {
                sinkErrorStack: [
                  {
                    type: 'failover',
                    id: failoverSink.id,
                    details: {
                      allFailed: true,
                      errorSinks: [
                        {
                          type: 'primary',
                          id: primarySink.id,
                        },
                        {
                          type: 'fallback',
                          id: fallbackSink1.id,
                        },
                        {
                          type: 'fallback',
                          id: fallbackSink2.id,
                        },
                      ],
                    },
                  },
                ],
              },
              cause: expect.objectContaining({
                errors: [primaryError, fallbackError1, fallbackError2],
              }) as AggregateError,
            });

            expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
            expect(fallbackSink1.emit).toHaveBeenCalledWith(testEntry);
            expect(fallbackSink2.emit).toHaveBeenCalledWith(testEntry);
          });
        });
      });

      describe('with empty fallbacks array', () => {
        describe('when primary sink fails', () => {
          it('should throw LoggerSinkError with allFailed set to true', async () => {
            const primaryError = new Error('primary failed');
            primarySink.emit.mockRejectedValue(primaryError);
            failoverSink = createFailoverSink(primarySink, []);

            const expectedRejects = expect(
              failoverSink.emit(testEntry),
            ).rejects;

            await expectedRejects.toThrow(LoggerSinkError);
            await expectedRejects.toMatchObject({
              message: 'Logging pipeline breaks due to sink errors',
              context: {
                sinkErrorStack: [
                  {
                    details: {
                      allFailed: true,
                      errorSinks: [
                        {
                          type: 'primary',
                          id: primarySink.id,
                        },
                      ],
                    },
                  },
                ],
              },
              cause: expect.objectContaining({
                errors: [primaryError],
              }) as AggregateError,
            });

            expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
          });
        });
      });

      describe('when handling nested LoggerSinkError from fallback sinks', () => {
        it('should break the error stack and throw an aggregated error', async () => {
          const primaryError = new Error('primary failed');
          const nestedError = new LoggerSinkError(
            [{ type: 'nested', id: fallbackSink1.id }],
            new Error('nested sink error'),
          );

          primarySink.emit.mockRejectedValue(primaryError);
          fallbackSink1.emit.mockRejectedValue(nestedError);

          failoverSink = createFailoverSink(primarySink, [
            fallbackSink1,
            fallbackSink2,
          ]);

          const expectedRejects = expect(failoverSink.emit(testEntry)).rejects;

          await expectedRejects.toThrow(LoggerSinkError);
          await expectedRejects.toMatchObject({
            context: {
              sinkErrorStack: [
                {
                  type: 'failover',
                  id: failoverSink.id,
                  details: {
                    allFailed: false,
                    errorSinks: [
                      {
                        type: 'primary',
                        id: primarySink.id,
                      },
                      {
                        type: 'fallback',
                        id: fallbackSink1.id,
                      },
                    ],
                  },
                },
              ],
            },
            cause: expect.objectContaining({
              errors: [primaryError, nestedError],
            }) as AggregateError,
          });
        });
      });
    });
  });
});
