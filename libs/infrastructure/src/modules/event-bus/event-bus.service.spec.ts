import { EventBusService } from './event-bus.service';

type TestEvents = {
  'test.a': { config: string; timestamp: number };
  'test.b': number;
};

describe('EventBusService', () => {
  let eventBusService: EventBusService<TestEvents>;

  beforeEach(() => {
    eventBusService = new EventBusService<TestEvents>();
  });

  describe('emit and on', () => {
    it('should emit event and resolve promise when event is received', async () => {
      const testPayload = { config: 'loaded', timestamp: Date.now() };

      const delay = 200;
      const timer = setTimeout(() => {
        eventBusService.emit('test.a', testPayload);
        timer.unref();
      }, delay);

      const receivedPayload = await eventBusService.on('test.a');

      expect(receivedPayload).toEqual(testPayload);
      expect(Date.now() - receivedPayload.timestamp).toBeGreaterThanOrEqual(
        delay,
      );
    });

    it('should handle multiple event listeners for same event', async () => {
      const testPayload = { config: 'loaded', timestamp: Date.now() };

      const listener1 = eventBusService.on('test.a');
      const listener2 = eventBusService.on('test.a');

      eventBusService.emit('test.a', testPayload);

      const [result1, result2] = await Promise.all([listener1, listener2]);

      expect(result1).toEqual(testPayload);
      expect(result2).toEqual(testPayload);
    });

    it('should handle events emitted before listeners are set up', async () => {
      const testPayload = { config: 'early-emit', timestamp: Date.now() };

      // Emit event first and wait
      eventBusService.emit('test.a', testPayload);

      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          resolve();
          timer.unref();
        }, 100);
      });

      // Then set up listener
      const receivedPayload = await eventBusService.on('test.a');

      expect(receivedPayload).toEqual(testPayload);
    });

    it('should handle different events independently', async () => {
      const payloadA = { config: 'independent A', timestamp: Date.now() };
      const payloadB = 42;

      const promiseA = eventBusService.on('test.a');
      const promiseB = eventBusService.on('test.b');

      eventBusService.emit('test.b', payloadB);

      const timeoutError = new Error('timeout');
      const timeout = new Promise((_, reject) => {
        const timer = setTimeout(() => {
          reject(timeoutError);
          timer.unref();
        }, 500);
      });
      await expect(Promise.race([promiseA, promiseB, timeout])).resolves.toBe(
        payloadB,
      );
      await expect(Promise.race([promiseA, timeout])).rejects.toThrow(
        timeoutError,
      );

      eventBusService.emit('test.a', payloadA);

      const resultA = await promiseA;
      expect(resultA).toEqual(payloadA);
    });
  });
});
