import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapEventBus, EventBusModule } from './event-bus.module';

describe('EventBusModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EventBusModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide EventBusService', () => {
    const service = module.get(BootstrapEventBus);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(BootstrapEventBus);
  });
});
