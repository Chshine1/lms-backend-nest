export class PhoneNumber {
  private readonly value: string;

  private constructor(phoneNumber: string) {
    this.value = phoneNumber;
  }

  static create(phoneNumber: string): PhoneNumber {
    const normalized = phoneNumber.trim();

    // E.164 format validation: +[country code][number] (max 15 digits)
    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (!e164Regex.test(normalized)) {
      throw new Error(
        'Invalid phone number format. Must conform to E.164 format (e.g., +1234567890)',
      );
    }

    return new PhoneNumber(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }

  getCountryCode(): string {
    // Extract country code (1-3 digits after +)
    const match = this.value.match(/^\+(\d{1,3})/);
    return match ? match[1] : '';
  }
}
