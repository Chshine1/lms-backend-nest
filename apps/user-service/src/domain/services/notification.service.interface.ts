/**
 * INotificationService - Domain interface for sending notifications.
 *
 * This interface defines the contract for notification operations required by the domain layer.
 * Implementations exist in the infrastructure layer and handle email, SMS, or other delivery methods.
 *
 * @remarks
 * This is a domain abstraction to keep the domain layer independent of notification infrastructure.
 * Actual implementations (e.g., MailgunNotificationService, SMTPNotificationService) are in infrastructure.
 */
export interface INotificationService {
  /**
   * Sends an email verification code to the specified email address.
   *
   * @param email - The recipient email address
   * @param code - The 6-digit numeric verification code
   * @returns A promise that resolves when the email has been queued/sent
   */
  sendVerificationEmail(email: string, code: string): Promise<void>;
}
