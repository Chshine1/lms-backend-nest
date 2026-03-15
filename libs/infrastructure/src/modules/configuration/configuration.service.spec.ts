import { ConfigurationService } from './configuration.service';
import { GetConfigValidationError } from './configuration.errors';
import { Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';

class TestConfig {
  @Expose()
  @IsDefined()
  @IsString()
  name!: string;

  @Expose()
  @IsDefined()
  @IsNumber()
  port!: number;
}

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => {
    service = new ConfigurationService({
      configuration: {
        name: 'test-app',
        port: 3000,
      },
    });
  });

  describe('get', () => {
    it('should return validated configuration object', () => {
      const config = service.get(TestConfig);

      expect(config).toBeInstanceOf(TestConfig);
      expect(config.name).toBe('test-app');
      expect(config.port).toBe(3000);
    });

    it('should throw GetConfigValidationError when validation fails', () => {
      const invalidService = new ConfigurationService({
        configuration: {
          name: 'test-app',
          // port is missing - required field
        },
      });

      expect(() => invalidService.get(TestConfig)).toThrow(
        GetConfigValidationError,
      );
    });

    it('should exclude extraneous values from configuration', () => {
      const serviceWithExtra = new ConfigurationService({
        configuration: {
          name: 'test-app',
          port: 3000,
          extraField: 'should-be-ignored',
        },
      });

      const config = serviceWithExtra.get(TestConfig);

      expect(config).toBeInstanceOf(TestConfig);
      expect(config.name).toBe('test-app');
      expect(config.port).toBe(3000);
      expect(
        (config as unknown as Record<string, unknown>)['extraField'],
      ).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should include validation errors in GetConfigValidationError', () => {
      const invalidService = new ConfigurationService({
        configuration: {
          // Both required fields are missing
        },
      });

      try {
        invalidService.get(TestConfig);
        fail('Expected GetConfigValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(GetConfigValidationError);
        expect(
          (error as GetConfigValidationError).validationErrors,
        ).toBeDefined();
        expect(
          (error as GetConfigValidationError).validationErrors.length,
        ).toBeGreaterThan(0);
      }
    });
  });
});
