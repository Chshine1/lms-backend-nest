import { Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import {
  ConfigLoadPipelineMiddlewareError,
  ConfigLoadPipelineValidationError,
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

      try {
        await middleware.loadValidated(loaded);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigLoadPipelineValidationError);
        const pipelineError = error as ConfigLoadPipelineValidationError;
        expect(typeof pipelineError.context.middleware).toBe('string');
        expect(pipelineError.context.location).toMatchObject({
          type: 'dependencies',
        });
        const location = pipelineError.context.location;
        if (location.type === 'dependencies') {
          expect(typeof location.dependency).toBe('string');
        }
      }
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

      try {
        await middleware.loadValidated(loaded);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigLoadPipelineMiddlewareError);
        const middlewareError = error as ConfigLoadPipelineMiddlewareError;
        expect(middlewareError.cause).toMatchObject({
          message: 'Simulated load error',
        });
        expect(middlewareError.context.middleware).toEqual(expect.any(String));
      }
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

      try {
        await middleware.loadValidated(loaded);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigLoadPipelineValidationError);
        const pipelineError = error as ConfigLoadPipelineValidationError;
        expect(pipelineError.context.middleware).toEqual(expect.any(String));
        expect(pipelineError.context.location).toMatchObject({
          type: 'target',
        });
      }
    });
  });
});
