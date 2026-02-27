import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerRuntimeService {
  private readonly logLevels = ['fatal', 'error', 'warn', 'info', 'debug'];
  private currentLevel = 'info';
  private isInitialized = false;

  async initialize(): Promise<void> {
    // 模拟初始化过程（如创建日志文件、连接日志服务等）
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.isInitialized = true;
  }

  fatal(message: string, metadata?: Record<string, any>): void {
    this.ensureInitialized();
    this.log('fatal', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.ensureInitialized();
    this.log('error', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.ensureInitialized();
    this.log('warn', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.ensureInitialized();
    this.log('info', message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.ensureInitialized();
    this.log('debug', message, metadata);
  }

  setLevel(level: string): void {
    this.ensureInitialized();
    if (this.logLevels.includes(level)) {
      this.currentLevel = level;
    }
  }

  getLevel(): string {
    this.ensureInitialized();
    return this.currentLevel;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Logger not initialized. Call initialize() first.');
    }
  }

  private log(
    level: string,
    message: string,
    metadata?: Record<string, any>,
  ): void {
    const levelIndex = this.logLevels.indexOf(level);
    const currentLevelIndex = this.logLevels.indexOf(this.currentLevel);

    if (levelIndex <= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
        pid: process.pid,
        hostname: require('os').hostname(),
        ...metadata,
      };

      // 结构化日志输出
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  child(metadata: Record<string, any>): LoggerRuntimeService {
    this.ensureInitialized();

    const childLogger = new LoggerRuntimeService();
    childLogger.currentLevel = this.currentLevel;
    childLogger.isInitialized = true;

    // 增强的子日志实现
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (
      level: string,
      message: string,
      childMetadata?: Record<string, any>,
    ) => {
      const mergedMetadata = {
        ...metadata,
        ...childMetadata,
        childLogger: true,
      };
      originalLog(level, message, mergedMetadata);
    };

    return childLogger;
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }
}
