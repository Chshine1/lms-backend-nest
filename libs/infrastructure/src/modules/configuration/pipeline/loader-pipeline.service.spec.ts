import { LoaderPipelineService } from './loader-pipeline.service';
import { LoaderMiddleware } from './loader.middleware';
import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { BootstrapEventBus } from '@app/infrastructure/modules/event-bus/event-bus.module';
import { LogLevel } from '@app/infrastructure/modules/logger/contracts/log.entry';

const mockLogger: LoggerService = {
  log: jest.fn().mockResolvedValue(undefined),
  flush: jest.fn().mockReturnValue(undefined),
} as unknown as LoggerService;

const mockEventBus: BootstrapEventBus = {
  emit: jest.fn().mockReturnValue(undefined),
} as unknown as BootstrapEventBus;

describe('LoaderPipelineService', () => {
  let service: LoaderPipelineService;
  let mockMiddlewares: jest.Mocked<LoaderMiddleware>[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('should execute middlewares by their order, then merge the results and post the loaded event', async () => {
      const middleware1 = {
        loadValidated: jest.fn().mockResolvedValue({ a: 1 }),
      };
      const middleware2 = {
        loadValidated: jest.fn().mockResolvedValue({ b: 2 }),
      };
      mockMiddlewares = [middleware1, middleware2];

      service = new LoaderPipelineService(
        mockLogger,
        mockEventBus,
        mockMiddlewares,
      );

      const initialConfig = { base: 0 };
      const result = await service.process(initialConfig);

      expect(middleware1.loadValidated).toHaveBeenCalledWith(initialConfig);
      expect(middleware2.loadValidated).toHaveBeenCalledWith(initialConfig);

      expect(result).toEqual({ base: 0, a: 1, b: 2 });

      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockLogger.log).toHaveBeenCalledWith({
        level: LogLevel.INFO,
        message: 'config loaded',
      });

      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
      expect(mockEventBus.emit).toHaveBeenCalledWith('config.loaded', result);
    });

    it('should return the initial config when no middleware is given', async () => {
      mockMiddlewares = [];
      service = new LoaderPipelineService(
        mockLogger,
        mockEventBus,
        mockMiddlewares,
      );

      const initialConfig = { base: 0 };
      const result = await service.process(initialConfig);

      expect(result).toEqual(initialConfig);
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'config.loaded',
        initialConfig,
      );
    });

    it("latter middlewares' fields should cover the former ones", async () => {
      const middleware1 = {
        loadValidated: jest.fn().mockResolvedValue({ key: 1 }),
      };
      const middleware2 = {
        loadValidated: jest.fn().mockResolvedValue({ key: 2 }),
      };
      mockMiddlewares = [middleware1, middleware2];

      service = new LoaderPipelineService(
        mockLogger,
        mockEventBus,
        mockMiddlewares,
      );

      const result = await service.process({ base: 0 });
      expect(result).toEqual({ base: 0, key: 2 });
    });

    it('should return unchanged result when one middleware loads an empty configuration part', async () => {
      const middleware1 = {
        loadValidated: jest.fn().mockResolvedValue({}),
      };
      mockMiddlewares = [middleware1];

      service = new LoaderPipelineService(
        mockLogger,
        mockEventBus,
        mockMiddlewares,
      );

      const initialConfig = { base: 0 };
      const result = await service.process(initialConfig);

      expect(result).toEqual(initialConfig);
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'config.loaded',
        initialConfig,
      );
    });
  });

  describe('error handling', () => {
    it('should stop the pipeline execution, throw error without posting the event', async () => {
      const error = new Error('Middleware failed');
      const middleware1 = {
        loadValidated: jest.fn().mockRejectedValue(error),
      };
      const middleware2 = {
        loadValidated: jest.fn(),
      };
      mockMiddlewares = [middleware1, middleware2];

      service = new LoaderPipelineService(
        mockLogger,
        mockEventBus,
        mockMiddlewares,
      );

      await expect(service.process({ base: 0 })).rejects.toThrow(error);

      expect(middleware1.loadValidated).toHaveBeenCalled();
      expect(middleware2.loadValidated).not.toHaveBeenCalled();
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });
});
