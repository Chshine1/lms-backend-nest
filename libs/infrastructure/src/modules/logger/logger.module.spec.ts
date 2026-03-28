import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';
import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigurationService } from '../configuration/configuration.service';
import { Environment } from '../../configs/configuration/schemas/env.schema';

describe('LoggerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue({
        environment: Environment.test,
        serviceName: 'test-service',
      }),
    };

    module = await Test.createTestingModule({
      imports: [ConfigurationModule, LoggerModule],
    })
      .overrideProvider(ConfigurationService)
      .useValue(mockConfigService)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide LoggerService', () => {
    const service = module.get(LoggerService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(LoggerService);
  });
});
