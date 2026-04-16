import { Injectable, Logger } from '@nestjs/common';
import type { INotificationService } from '../../domain/services/notification.service.interface';

/**
 * NotificationService - Infrastructure implementation for sending notifications.
 *
 * This is a stub/placeholder implementation. In production, this would integrate with:
 * - Email service (SMTP, SendGrid, Mailgun, AWS SES, etc.)
 * - SMS service (Twilio, AWS SNS, etc.)
 *
 * @remarks
 * Currently logs verification emails to console. Can be extended to queue emails via
 * message broker (RabbitMQ, Redis) or call external notification providers.
 */
@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /**
   * Sends an email verification code to the specified email address.
   *
   * @param email - The recipient email address
   * @param code - The 6-digit numeric verification code
   */
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    this.logger.log(
      `[STUB] Sending verification email to ${email} with code: ${code}`,
    );

    // TODO: Implement actual email sending logic here:
    // 1. Queue email in message broker (RabbitMQ, Redis)
    // 2. Or call external email service (SendGrid, Mailgun)
    // 3. Or send via SMTP if configured

    // Simulating async operation
    await Promise.resolve();
  }
}
