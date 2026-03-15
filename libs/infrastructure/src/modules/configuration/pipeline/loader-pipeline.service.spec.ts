import { LoaderPipelineService } from './loader-pipeline.service';
import { LoaderMiddleware } from './loader.middleware';
import { LoggerService } from '@app/infrastructure/modules/logger/logger.service';
import { BootstrapEventBus } from '@app/infrastructure/modules/event-bus/event-bus.module';

const mockLogger: LoggerService = {
  log: jest.fn().mockResolvedValue(undefined),
  flush: jest.fn().mockReturnValue(undefined),
} as unknown as LoggerService;

const mockEventBus: BootstrapEventBus = new BootstrapEventBus();

describe('LoaderPipelineService', () => {
  let service: LoaderPipelineService;
  let mockMiddlewares: jest.Mocked<LoaderMiddleware>[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('P-01: 多个中间件正常执行', () => {
    it('应按顺序调用中间件，合并结果，记录日志并触发事件', async () => {
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
        level: 'INFO',
        message: 'config loaded',
      });

      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
      expect(mockEventBus.emit).toHaveBeenCalledWith('config.loaded', result);
    });
  });

  describe('P-02: 中间件列表为空', () => {
    it('应直接返回初始配置，不记录日志，但仍触发事件', async () => {
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
  });

  describe('P-03: 中间件抛出异常', () => {
    it('应停止执行后续中间件，异常向上传播，不触发事件', async () => {
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

  describe('P-04: 合并行为验证（覆盖）', () => {
    it('后执行的中间件应覆盖前者的同名字段', async () => {
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
  });

  describe('P-05 (合并): 中间件返回部分字段或空对象', () => {
    it('应正确处理返回部分字段的情况，添加新字段，保留原有字段', async () => {
      const middleware1 = {
        loadValidated: jest.fn().mockResolvedValue({ newField: 'value' }),
      };
      const middleware2 = {
        loadValidated: jest.fn().mockResolvedValue({ existing: 'updated' }),
      };
      mockMiddlewares = [middleware1, middleware2];

      service = new LoaderPipelineService(
        mockLogger,
        mockEventBus,
        mockMiddlewares,
      );

      const initialConfig = { existing: 'original', base: 0 };
      const result = await service.process(initialConfig);

      expect(result).toEqual({
        base: 0,
        existing: 'updated',
        newField: 'value',
      });
    });

    it('应正确处理返回空对象的情况，结果保持不变', async () => {
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
});
