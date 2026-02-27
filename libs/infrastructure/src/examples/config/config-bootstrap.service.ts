import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigBootstrapService {
  private readonly config = new Map<string, any>();

  constructor() {
    this.config.set('app.name', process.env.APP_NAME || 'MyApp');
    this.config.set('app.env', process.env.NODE_ENV || 'development');
    this.config.set('app.port', parseInt(process.env.PORT || '3000'));
    this.config.set('log.level', process.env.LOG_LEVEL || 'info');
  }

  get<T = any>(key: string): T | undefined {
    return this.config.get(key);
  }

  getOrThrow<T = any>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined) {
      throw new Error(`Configuration key '${key}' not found`);
    }
    return value;
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  set<T = any>(key: string, value: T): void {
    this.config.set(key, value);
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.config);
  }
}