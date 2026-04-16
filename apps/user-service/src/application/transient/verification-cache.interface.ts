/**
 * IVerificationCache - Transient store for email verification codes.
 *
 * This interface defines a short-lived cache (TTL-based) for storing email verification codes
 * during the multi-step registration flow. It is NOT part of the domain model.
 *
 * @remarks
 * - Implementations can use Redis, in-memory store, or other ephemeral storage.
 * - Codes have a 5-minute TTL and are invalidated after 3 consecutive failed attempts.
 * - Codes are bound to a specific email address.
 * - Codes are destroyed immediately after successful verification or upon expiry.
 */
export interface IVerificationCache {
  /**
   * Stores a verification code for a given email with a 5-minute TTL.
   *
   * @param email - The email address the code is bound to
   * @param code - The 6-digit numeric verification code
   * @param ttlSeconds - Time-to-live in seconds (default: 300 for 5 minutes)
   */
  set(email: string, code: string, ttlSeconds?: number): Promise<void>;

  /**
   * Retrieves and validates a verification code for a given email.
   *
   * @param email - The email address the code is bound to
   * @returns The stored code if valid and not expired, null if not found or expired
   */
  get(email: string): Promise<string | null>;

  /**
   * Removes a verification code from the cache (called after successful verification).
   *
   * @param email - The email address the code is bound to
   */
  delete(email: string): Promise<void>;

  /**
   * Increments the failed attempt counter for an email and checks if it exceeds the limit (3).
   *
   * @param email - The email address
   * @returns true if the code should be invalidated (3+ failed attempts), false otherwise
   */
  recordFailedAttempt(email: string): Promise<boolean>;

  /**
   * Resets the failed attempt counter for an email.
   *
   * @param email - The email address
   */
  resetFailedAttempts(email: string): Promise<void>;
}
