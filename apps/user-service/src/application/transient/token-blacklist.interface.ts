/**
 * ITokenBlacklist - Transient store for consumed/revoked tokens.
 *
 * This interface defines a cache for tracking consumed registration tokens (RegistrationToken)
 * to prevent replay attacks. It is NOT part of the domain model.
 *
 * @remarks
 * - Implementation can use Redis, in-memory store, or other ephemeral storage.
 * - Tokens are stored with a TTL matching their expiration time.
 * - Once a token is used for registration, it is blacklisted and cannot be reused.
 * - Uses the `jti` (JWT ID) claim as the key for uniqueness across instances.
 */
export interface ITokenBlacklist {
  /**
   * Adds a token to the blacklist.
   *
   * @param jti - The JWT ID (jti claim) of the token
   * @param expiresAt - The timestamp when the token expires (ISO string or Date)
   */
  add(jti: string, expiresAt: Date | string): Promise<void>;

  /**
   * Checks if a token is blacklisted.
   *
   * @param jti - The JWT ID (jti claim) of the token
   * @returns true if the token is blacklisted, false if it can still be used
   */
  isBlacklisted(jti: string): Promise<boolean>;
}
