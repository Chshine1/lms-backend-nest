import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationModule } from './configuration.module';
import { ConfigurationLoader } from './configuration.loader';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigurationModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide ConfigurationLoader', () => {
    const loader = module.get(ConfigurationLoader);
    expect(loader).toBeDefined();
    expect(loader).toBeInstanceOf(ConfigurationLoader);
  });

  it('should provide ConfigurationService', () => {
    const service = module.get(ConfigurationService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ConfigurationService);
  });

  it('should export ConfigurationLoader and ConfigurationService', () => {
    const loader = module.get(ConfigurationLoader);
    const service = module.get(ConfigurationService);

    expect(loader).toBeDefined();
    expect(service).toBeDefined();
  });
});
