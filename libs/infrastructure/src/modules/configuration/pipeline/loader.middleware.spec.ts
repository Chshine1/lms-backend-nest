import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsNumber } from 'class-validator';
import {
  ConfigLoadPipelineValidationError,
  ConfigLoadPipelineMiddlewareError,
} from '../../../infrastructure.errors';
import { LoaderMiddlewareBase } from './loader.middleware';

class DependencyA {
  @Expose()
  @IsDefined()
  @IsString()
  a!: string;
}

class DependencyB {
  @Expose()
  @IsDefined()
  @IsNumber()
  b!: number;
}

class TargetConfig {
  @Expose()
  @IsDefined()
  @IsString()
  c!: string;
}

class TestLoaderMiddleware extends LoaderMiddlewareBase<
  [DependencyA, DependencyB]
> {
  protected load(
    dependencies: [DependencyA, DependencyB],
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({
      c: `result-${dependencies[0].a}-${dependencies[1].b.toString()}`,
    });
  }
}

describe('LoaderMiddlewareBase', () => {
  describe('load with validation', () => {
    it('should extract dependencies, load then validate result', async () => {
      const middleware = new TestLoaderMiddleware(
        [DependencyA, DependencyB],
        TargetConfig,
      );

      const loaded = { a: 'hello', b: 42 };
      const result = await middleware.loadValidated(loaded);

      expect(result).toEqual({
        a: 'hello',
        b: 42,
        c: 'result-hello-42',
      });
    });

    it('should load normally, without dependency validation when no dependencies are passed', async () => {
      class NoDepsLoaderMiddleware extends LoaderMiddlewareBase<[]> {
        protected load(): Promise<Record<string, unknown>> {
          return Promise.resolve({ c: 'no-deps' });
        }
      }
      const middleware = new NoDepsLoaderMiddleware([], TargetConfig);

      const loaded = { some: 'irrelevant' };
      const result = await middleware.loadValidated(loaded);

      expect(result).toEqual({
        some: 'irrelevant',
        c: 'no-deps',
      });
    });
  });

  describe('error handling', () => {
    it('should throw ConfigLoadPipelineValidationError, indicating dependencies validation error', async () => {
      const middleware = new TestLoaderMiddleware(
        [DependencyA, DependencyB],
        TargetConfig,
      );

      const loaded = { a: 'hello' };

      const expectedRejects = expect(middleware.loadValidated(loaded)).rejects;

      await expectedRejects.toThrow(ConfigLoadPipelineValidationError);
      await expectedRejects.toThrow(
        expect.objectContaining({
          context: expect.objectContaining({
            middleware: TestLoaderMiddleware.name,
            location: {
              type: 'dependencies',
              dependency: DependencyB.name,
            },
          }),
        }),
      );
    });

    it('should catch the inner error and encapsulated by ConfigLoadPipelineMiddlewareError', async () => {
      class ThrowingLoaderMiddleware extends LoaderMiddlewareBase<
        [DependencyA, DependencyB]
      > {
        protected load(): Promise<Record<string, unknown>> {
          throw new Error('Simulated load error');
        }
      }
      const middleware = new ThrowingLoaderMiddleware(
        [DependencyA, DependencyB],
        TargetConfig,
      );

      const loaded = { a: 'hello', b: 42 };

      const expectedRejects = expect(middleware.loadValidated(loaded)).rejects;

      await expectedRejects.toThrow(ConfigLoadPipelineMiddlewareError);
      await expectedRejects.toThrow(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: 'Simulated load error',
          }),
          context: expect.objectContaining({
            middleware: ThrowingLoaderMiddleware.name,
          }),
        }),
      );
    });

    it('should throw ConfigLoadPipelineValidationError, indicating target validation error', async () => {
      class InvalidTargetMiddleware extends LoaderMiddlewareBase<
        [DependencyA, DependencyB]
      > {
        protected load(): Promise<Record<string, unknown>> {
          return Promise.resolve({ wrong: 'data' });
        }
      }

      const middleware = new InvalidTargetMiddleware(
        [DependencyA, DependencyB],
        TargetConfig,
      );

      const loaded = { a: 'hello', b: 42 };

      const expectedRejects = expect(middleware.loadValidated(loaded)).rejects;

      await expectedRejects.toThrow(ConfigLoadPipelineValidationError);
      await expectedRejects.toThrow(
        expect.objectContaining({
          context: expect.objectContaining({
            middleware: InvalidTargetMiddleware.name,
            location: {
              type: 'target',
            },
          }),
        }),
      );
    });
  });
});
