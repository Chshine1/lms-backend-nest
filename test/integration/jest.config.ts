import type { Config } from 'jest';
import * as path from 'path';

const config: Config = {
  displayName: 'integration',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: path.resolve(__dirname, '../..'),
  testMatch: ['<rootDir>/test/integration/suites/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/test/integration/tsconfig.json',
      },
    ],
  },
  testEnvironment: 'node',
  // globalSetup / globalTeardown run in the main Jest process — safe to store
  // the DockerComposeEnvironment reference on `global` for teardown.
  globalSetup: '<rootDir>/test/integration/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/integration/setup/global-teardown.ts',
  // Each suite can be slow while waiting for RabbitMQ RPC round-trips
  testTimeout: 60_000,
  // Run suites sequentially so DB state is predictable across files
  maxWorkers: 1,
  setupFiles: ['reflect-metadata'],
  moduleNameMapper: {
    '^@app/audit(|/.*)$': '<rootDir>/libs/audit/src/$1',
    '^@app/authentication(|/.*)$': '<rootDir>/libs/authentication/src/$1',
    '^@app/contracts(|/.*)$': '<rootDir>/libs/contracts/src/$1',
    '^@app/core(|/.*)$': '<rootDir>/libs/core/src/$1',
    '^@app/infrastructure(|/.*)$': '<rootDir>/libs/infrastructure/src/$1',
    '^@app/trace(|/.*)$': '<rootDir>/libs/trace/src/$1',
    '^@app/typed-client(|/.*)$': '<rootDir>/libs/typed-client/src/$1',
    '^@/(.*)$': '<rootDir>/apps/$1',
  },
};

export default config;
