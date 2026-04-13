export class InvitationCode {
  private readonly value: string;

  private constructor(code: string) {
    this.value = code;
  }

  static create(code: string): InvitationCode {
    const normalized = code.toUpperCase().trim();

    // Alphanumeric, exactly 8 characters
    const codeRegex = /^[A-Z0-9]{8}$/;

    if (!codeRegex.test(normalized)) {
      throw new Error(
        'Invalid invitation code format. Must be exactly 8 alphanumeric characters',
      );
    }

    return new InvitationCode(normalized);
  }

  getValue(): string {
    return this.value;
  }

  matches(input: string): boolean {
    return this.value === input.toUpperCase().trim();
  }
}
