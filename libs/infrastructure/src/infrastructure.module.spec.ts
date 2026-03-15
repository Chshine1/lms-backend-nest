import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureModule } from './infrastructure.module';

describe('InfrastructureModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [InfrastructureModule.forRoot()],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should initialize without errors', () => {
    // The module should compile and initialize successfully
    expect(module).toBeTruthy();
  });

  it('should have forRoot method that returns DynamicModule', () => {
    const dynamicModule = InfrastructureModule.forRoot();
    
    expect(dynamicModule).toBeDefined();
    expect(dynamicModule.module).toBe(InfrastructureModule);
    expect(dynamicModule.providers).toBeDefined();
  });
});