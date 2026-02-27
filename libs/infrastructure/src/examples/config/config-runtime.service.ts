import { Injectable } from '@nestjs/common';

/**
 * 配置服务的运行时实现
 * 支持从远程配置中心加载配置
 */
@Injectable()
export class ConfigRuntimeService {
  private readonly config = new Map<string, any>();
  private isLoaded = false;

  constructor() {
    // 运行时配置需要显式加载
  }

  async loadFromRemote(): Promise<void> {
    // 模拟从远程配置中心加载配置
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.config.set('app.name', 'MyApp-Runtime');
    this.config.set('app.env', 'production');
    this.config.set('app.port', 8080);
    this.config.set('log.level', 'debug');
    this.config.set('database.host', 'localhost');
    this.config.set('database.port', 5432);
    
    this.isLoaded = true;
  }

  get<T = any>(key: string): T | undefined {
    if (!this.isLoaded) {
      throw new Error('Configuration not loaded. Call loadFromRemote() first.');
    }
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
    if (!this.isLoaded) {
      throw new Error('Configuration not loaded. Call loadFromRemote() first.');
    }
    return this.config.has(key);
  }

  set<T = any>(key: string, value: T): void {
    this.config.set(key, value);
  }

  getAll(): Record<string, any> {
    if (!this.isLoaded) {
      throw new Error('Configuration not loaded. Call loadFromRemote() first.');
    }
    return Object.fromEntries(this.config);
  }

  isConfigurationLoaded(): boolean {
    return this.isLoaded;
  }
}