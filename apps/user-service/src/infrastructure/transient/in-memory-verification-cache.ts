import { Injectable, Logger } from '@nestjs/common';
import type { IVerificationCache } from '../../application/transient/verification-cache.interface';

interface CacheEntry {
  code: string;
  expiresAt: number;
  failedAttempts: number;
}

/**
 * InMemoryVerificationCache - In-memory implementation of verification code cache.
 *
 * This is a development/fallback implementation. For production, use Redis-based implementation.
 *
 * @remarks
 * - Uses in-process memory store (not suitable for distributed systems)
 * - Codes expire after TTL (default 5 minutes = 300 seconds)
 * - Failed attempts are tracked and code is invalidated after 3 failures
 * - Should be replaced with RedisVerificationCache for production
 */
@Injectable()
export class InMemoryVerificationCache implements IVerificationCache {
  private readonly logger = new Logger(InMemoryVerificationCache.name);
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTtl = 300; // 5 minutes in seconds

  async set(
    email: string,
    code: string,
    ttlSeconds: number = this.defaultTtl,
  ): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(email, {
      code,
      expiresAt,
      failedAttempts: 0,
    });
    this.logger.debug(
      `Stored verification code for ${email}, expires in ${ttlSeconds}s`,
    );
  }

  async get(email: string): Promise<string | null> {
    const entry = this.cache.get(email);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(email);
      this.logger.debug(`Verification code for ${email} has expired`);
      return null;
    }

    return entry.code;
  }

  async delete(email: string): Promise<void> {
    this.cache.delete(email);
    this.logger.debug(`Deleted verification code for ${email}`);
  }

  async recordFailedAttempt(email: string): Promise<boolean> {
    const entry = this.cache.get(email);

    if (!entry) {
      return false; // Code doesn't exist, let caller handle it
    }

    entry.failedAttempts++;
    this.logger.debug(
      `Recorded failed attempt for ${email} (${entry.failedAttempts}/3)`,
    );

    // Invalidate after 3 failed attempts
    if (entry.failedAttempts >= 3) {
      this.cache.delete(email);
      this.logger.warn(
        `Invalidated verification code for ${email} (3+ failures)`,
      );
      return true;
    }

    return false;
  }

  async resetFailedAttempts(email: string): Promise<void> {
    const entry = this.cache.get(email);

    if (entry) {
      entry.failedAttempts = 0;
      this.logger.debug(`Reset failed attempts for ${email}`);
    }
  }
}
