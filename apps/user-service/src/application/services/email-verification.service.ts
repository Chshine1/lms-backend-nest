import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import type { IVerificationCache } from '../transient/verification-cache.interface';
import type { ITokenBlacklist } from '../transient/token-blacklist.interface';
import type { INotificationService } from '../../domain/services/notification.service.interface';
import { InvalidVerificationCodeError } from '../../domain/errors';
import { Inject } from '@nestjs/common';
import { InMemoryVerificationCache } from '../../infrastructure/transient/in-memory-verification-cache';
import { InMemoryTokenBlacklist } from '../../infrastructure/transient/in-memory-token-blacklist';
import { NotificationService } from '../../infrastructure/services/notification.service';

/**
 * EmailVerificationService - Orchestrates the email verification workflow.
 *
 * Handles the 2-step email verification process:
 * 1. Generate and send a 6-digit code
 * 2. Validate code and issue a RegistrationToken JWT
 *
 * This service is used by UserApplicationService during the stepwise registration flow.
 */
@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly verificationCodeLength = 6;
  private readonly verificationCodeTtl = 300; // 5 minutes

  constructor(
    @Inject(InMemoryVerificationCache)
    private readonly verificationCache: IVerificationCache,
    @Inject(InMemoryTokenBlacklist)
    private readonly tokenBlacklist: ITokenBlacklist,
    @Inject(NotificationService)
    private readonly notificationService: INotificationService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Generates a verification code and sends it to the specified email.
   *
   * @param email - The email address to send code to
   * @throws EmailAlreadyExistsException if email is already registered
   */
  async requestEmailVerification(email: string): Promise<void> {
    // Generate 6-digit code
    const code = this.generateVerificationCode();

    // Store in cache with 5-minute TTL
    await this.verificationCache.set(email, code, this.verificationCodeTtl);

    // Send email
    await this.notificationService.sendVerificationEmail(email, code);

    this.logger.log(`Email verification requested for ${email}`);
  }

  /**
   * Validates the verification code and issues a RegistrationToken JWT.
   *
   * @param email - The email address
   * @param code - The 6-digit code provided by user
   * @returns Object containing the registration token
   * @throws InvalidVerificationCodeException if code is invalid or expired
   */
  async verifyEmailAndIssueToken(
    email: string,
    code: string,
  ): Promise<{ registrationToken: string }> {
    // Retrieve cached code
    const storedCode = await this.verificationCache.get(email);

    if (!storedCode) {
      // Code expired or never existed
      throw new InvalidVerificationCodeError(
        'Verification code has expired or does not exist',
      );
    }

    if (storedCode !== code) {
      // Code mismatch - record failed attempt
      const shouldInvalidate =
        await this.verificationCache.recordFailedAttempt(email);
      if (shouldInvalidate) {
        throw new InvalidVerificationCodeError(
          'Too many failed attempts. Please request a new code.',
        );
      }
      throw new InvalidVerificationCodeError('Invalid verification code');
    }

    // Code is valid - remove from cache and reset attempts
    await this.verificationCache.delete(email);
    await this.verificationCache.resetFailedAttempts(email);

    // Issue RegistrationToken JWT
    const jti = uuidv4();
    const registrationToken = this.jwtService.sign(
      { email },
      {
        expiresIn: '15m',
        jwtid: jti,
      },
    );

    this.logger.log(`Email verified and token issued for ${email}`);

    return { registrationToken };
  }

  /**
   * Verifies a registration token and extracts the email claim.
   *
   * @param token - The JWT token to verify
   * @returns The decoded token with email claim
   * @throws UnauthorizedException if token is invalid, expired, or blacklisted
   */
  async verifyRegistrationToken(
    token: string,
  ): Promise<{ email: string; jti: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);

      // Check if token is blacklisted
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(
        decoded.jti,
      );
      if (isBlacklisted) {
        throw new InvalidVerificationCodeError('Token has already been used');
      }

      return { email: decoded.email, jti: decoded.jti };
    } catch (error) {
      if (error instanceof InvalidVerificationCodeError) {
        throw error;
      }
      throw new InvalidVerificationCodeError(
        'Invalid or expired registration token',
      );
    }
  }

  /**
   * Marks a registration token as consumed by adding it to the blacklist.
   *
   * @param jti - The JWT ID of the token
   * @param expiresAt - When the token expires
   */
  async consumeRegistrationToken(jti: string, expiresAt: Date): Promise<void> {
    await this.tokenBlacklist.add(jti, expiresAt);
    this.logger.log(`Registration token ${jti} marked as consumed`);
  }

  /**
   * Generates a random 6-digit numeric code for email verification.
   *
   * @returns A 6-digit numeric string
   */
  private generateVerificationCode(): string {
    let code = '';
    for (let i = 0; i < this.verificationCodeLength; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }
}
