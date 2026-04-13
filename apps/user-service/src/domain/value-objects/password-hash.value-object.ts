export class PasswordHash {
  private readonly value: string;

  private constructor(hash: string) {
    this.value = hash;
  }

  static create(hash: string): PasswordHash {
    // Validate bcrypt hash format: $2a$, $2b$, or $2y$ followed by cost and hash
    const bcryptRegex = /^\$2[aby]\$\d{2}\$.{53}$/;

    // Validate argon2 hash format
    const argon2Regex = /^\$argon2(i|d|id)\$.+/;

    if (!bcryptRegex.test(hash) && !argon2Regex.test(hash)) {
      throw new Error(
        'Invalid password hash format. Must be a valid bcrypt or argon2 hash',
      );
    }

    return new PasswordHash(hash);
  }

  getValue(): string {
    return this.value;
  }

  // This method should be implemented using the actual hasher service
  // Here we just define the interface
  async matchesPlaintext(
    plaintext: string,
    hasher: PasswordHasher,
  ): Promise<boolean> {
    return hasher.compare(plaintext, this.value);
  }
}

// Interface for password hasher service
export interface PasswordHasher {
  hash(plaintext: string): Promise<string>;
  compare(plaintext: string, hash: string): Promise<boolean>;
}
