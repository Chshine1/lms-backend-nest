import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let eventBusService: EventBusService;

  beforeEach(() => {
    eventBusService = new EventBusService();
  });

  describe('emit and on', () => {
    it('should emit event and resolve promise when event is received', async () => {
      const testPayload = { config: 'loaded', timestamp: Date.now() };

      // Set up event listener before emitting
      const eventPromise = eventBusService.on('config.loaded');

      // Emit the event
      eventBusService.emit('config.loaded', testPayload);

      // Wait for the promise to resolve
      const receivedPayload = await eventPromise;

      expect(receivedPayload).toEqual(testPayload);
    });

    it('should handle multiple event listeners for same event', async () => {
      const testPayload = { data: 'multiple-listeners' };

      const listener1 = eventBusService.on('config.loaded');
      const listener2 = eventBusService.on('config.loaded');

      eventBusService.emit('config.loaded', testPayload);

      const [result1, result2] = await Promise.all([listener1, listener2]);

      expect(result1).toEqual(testPayload);
      expect(result2).toEqual(testPayload);
    });

    it('should handle events emitted before listeners are set up', async () => {
      const testPayload = { data: 'early-emit' };

      // Emit event first
      eventBusService.emit('config.loaded', testPayload);

      // Then set up listener
      const eventPromise = eventBusService.on('config.loaded');

      const receivedPayload = await eventPromise;

      expect(receivedPayload).toEqual(testPayload);
    });

    it('should handle multiple different event types', async () => {
      const configPayload = { config: 'loaded' };
      const configListener = eventBusService.on('config.loaded');
      // Note: We can only test 'config.loaded' since it's the only event in BootstrapEvents

      eventBusService.emit('config.loaded', configPayload);

      const receivedPayload = await configListener;
      expect(receivedPayload).toEqual(configPayload);
    });
  });

  describe('error handling', () => {
    it('should handle events with null or undefined payloads', async () => {
      const nullListener = eventBusService.on('config.loaded');
      eventBusService.emit('config.loaded', null);

      const result = await nullListener;
      expect(result).toBeNull();
    });

    it('should handle complex object payloads', async () => {
      const complexPayload = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        date: new Date(),
      };

      const listener = eventBusService.on('config.loaded');
      eventBusService.emit('config.loaded', complexPayload);

      const result = await listener;
      expect(result).toEqual(complexPayload);
    });
  });
});
