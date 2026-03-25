import { ConfigurationService } from './configuration.service';
import { Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { GetConfigValidationError } from './errors';

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
  function createConfigurationService(
    configuration: Record<string, unknown>,
  ): ConfigurationService {
    return new ConfigurationService({ configuration });
  }

  function createValidConfiguration(): Record<string, unknown> {
    return {
      name: 'test-app',
      port: 3000,
    };
  }

  describe('get', () => {
    describe('with valid configuration', () => {
      it('should return validated configuration object', () => {
        const validService = createConfigurationService(
          createValidConfiguration(),
        );

        const config = validService.get(TestConfig);

        expect(config).toBeInstanceOf(TestConfig);
        expect(config.name).toBe('test-app');
        expect(config.port).toBe(3000);
      });
    });

    describe('with invalid configuration', () => {
      it('should throw GetConfigValidationError when required field is missing', () => {
        const invalidConfiguration = {
          name: 'test-app',
        };
        const invalidService = createConfigurationService(invalidConfiguration);

        expect(() => invalidService.get(TestConfig)).toThrow(
          GetConfigValidationError,
        );
      });
    });

    describe('with extraneous configuration values', () => {
      it('should exclude extraneous values from configuration object', () => {
        const configurationWithExtra = {
          name: 'test-app',
          port: 3000,
          extraField: 'should-be-ignored',
        };
        const serviceWithExtra = createConfigurationService(
          configurationWithExtra,
        );

        const config = serviceWithExtra.get(TestConfig);

        expect(config).toBeInstanceOf(TestConfig);
        expect(config.name).toBe('test-app');
        expect(config.port).toBe(3000);
        expect(
          (config as unknown as Record<string, unknown>)['extraField'],
        ).toBeUndefined();
      });
    });
  });

  describe('error handling', () => {
    describe('when configuration is completely invalid', () => {
      it('should include validation errors in GetConfigValidationError', () => {
        const emptyConfiguration = {};
        const invalidService = createConfigurationService(emptyConfiguration);

        const expectedThrows = (): TestConfig => invalidService.get(TestConfig);

        expect(expectedThrows).toThrow(GetConfigValidationError);
        expect(expectedThrows).toThrow(
          expect.objectContaining({
            validationErrors: expect.arrayContaining([
              expect.objectContaining({
                property: expect.any(String),
              }),
            ]),
          }),
        );
      });
    });
  });

  describe('getByKey', () => {
    describe('with valid configuration key', () => {
      it('should return validated configuration object for the specified key', () => {
        const nestedConfiguration = {
          db: {
            host: 'localhost',
            port: 5432,
          },
        };
        const service = createConfigurationService(nestedConfiguration);

        class DbConfig {
          @Expose()
          @IsDefined()
          @IsString()
          host!: string;

          @Expose()
          @IsDefined()
          @IsNumber()
          port!: number;
        }

        const config = service.getByKey('db', DbConfig);

        expect(config).toBeInstanceOf(DbConfig);
        expect(config.host).toBe('localhost');
        expect(config.port).toBe(5432);
      });
    });

    describe('with key but invalid configuration', () => {
      it('should throw GetConfigValidationError when required fields are missing', () => {
        const configuration = {
          db: {},
        };
        const service = createConfigurationService(configuration);

        class DbConfig {
          @Expose()
          @IsDefined()
          @IsString()
          host!: string;
        }

        expect(() => service.getByKey('db', DbConfig)).toThrow(
          GetConfigValidationError,
        );
      });
    });

    describe('with non-existent key', () => {
      it('should throw GetConfigValidationError when key does not exist', () => {
        const configuration = {
          existingKey: { value: 1 },
        };
        const service = createConfigurationService(configuration);

        class MissingConfig {
          @Expose()
          @IsDefined()
          @IsString()
          value!: string;
        }

        expect(() => service.getByKey('missingKey', MissingConfig)).toThrow(
          GetConfigValidationError,
        );
      });
    });
  });
});
