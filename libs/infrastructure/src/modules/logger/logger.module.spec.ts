import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from './logger.module';
import { LoggerLoader } from './logger.loader';
import { LoggerService } from './logger.service';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';

describe('LoggerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EventBusModule, ConfigurationModule, LoggerModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide LoggerLoader', () => {
    const loader = module.get(LoggerLoader);
    expect(loader).toBeDefined();
    expect(loader).toBeInstanceOf(LoggerLoader);
  });

  it('should provide LoggerService', () => {
    const service = module.get(LoggerService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(LoggerService);
  });
});
