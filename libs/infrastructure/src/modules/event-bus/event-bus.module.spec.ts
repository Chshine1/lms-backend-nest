import { Test, TestingModule } from '@nestjs/testing';
import { EventBusModule } from './event-bus.module';
import { EventBusService } from './event-bus.service';

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
    const service = module.get(EventBusService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(EventBusService);
  });

  it('should export EventBusService', () => {
    const service = module.get(EventBusService);
    expect(service).toBeDefined();
  });
});