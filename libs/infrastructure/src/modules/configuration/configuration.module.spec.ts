import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationModule } from './configuration.module';
import { ConfigurationService } from './configuration.service';
import { Environment } from '../../configs/configuration/schemas/env.schema';

describe('ConfigurationModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue({
        environment: Environment.test,
        serviceName: 'test-service',
      }),
    };

    module = await Test.createTestingModule({
      imports: [ConfigurationModule],
    })
      .overrideProvider(ConfigurationService)
      .useValue(mockConfigService)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide ConfigurationService', () => {
    const service = module.get(ConfigurationService);
    expect(service).toBeDefined();
    expect(service).toHaveProperty('get');
  });
});
