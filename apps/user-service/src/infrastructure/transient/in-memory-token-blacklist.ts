import { Injectable, Logger } from '@nestjs/common';
import type { ITokenBlacklist } from '../../application/transient/token-blacklist.interface';

interface BlacklistEntry {
  expiresAt: number;
}

/**
 * InMemoryTokenBlacklist - In-memory implementation of token blacklist.
 *
 * This is a development/fallback implementation. For production, use Redis-based implementation.
 *
 * @remarks
 * - Uses in-process memory store (not suitable for distributed systems)
 * - Tokens are stored with TTL based on their expiration time
 * - Expired tokens are removed from the blacklist
 * - Should be replaced with RedisTokenBlacklist for production
 */
@Injectable()
export class InMemoryTokenBlacklist implements ITokenBlacklist {
  private readonly logger = new Logger(InMemoryTokenBlacklist.name);
  private blacklist: Map<string, BlacklistEntry> = new Map();

  async add(jti: string, expiresAt: Date | string): Promise<void> {
    const expiresAtMs =
      typeof expiresAt === 'string'
        ? new Date(expiresAt).getTime()
        : expiresAt.getTime();

    this.blacklist.set(jti, { expiresAt: expiresAtMs });

    const ttlSeconds = Math.ceil((expiresAtMs - Date.now()) / 1000);
    this.logger.debug(
      `Added token ${jti} to blacklist, expires in ${ttlSeconds}s`,
    );

    // Clean up expired tokens periodically
    this.cleanupExpired();
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const entry = this.blacklist.get(jti);

    if (!entry) {
      return false; // Token not in blacklist
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.blacklist.delete(jti);
      this.logger.debug(`Token ${jti} has expired, removed from blacklist`);
      return false;
    }

    return true; // Token is blacklisted and not expired
  }

  /**
   * Cleans up expired entries from the blacklist.
   * Called periodically to prevent memory leaks.
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [jti, entry] of this.blacklist.entries()) {
      if (now > entry.expiresAt) {
        this.blacklist.delete(jti);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired tokens from blacklist`);
    }
  }
}
