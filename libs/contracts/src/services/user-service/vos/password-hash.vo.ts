import { EntityProperty, Type } from '@mikro-orm/core';

export class PasswordHashType extends Type<PasswordHashVo, string> {
  override convertToDatabaseValue(vo: PasswordHashVo): string {
    return vo.value;
  }

  override convertToJSValue(dbValue: string): PasswordHashVo {
    return PasswordHashVo.create(dbValue);
  }

  override getColumnType(prop: EntityProperty): string {
    return `varchar(${String(prop.length ?? 255)})`;
  }
}

export class PasswordHashVo {
  private constructor(public readonly value: string) {}

  static create(hash: string): PasswordHashVo {
    // Validate bcrypt hash format: $2a$, $2b$, or $2y$ followed by cost and hash
    const bcryptRegex = /^\$2[aby]\$\d{2}\$.{53}$/;
    // Validate argon2 hash format
    const argon2Regex = /^\$argon2(i|d|id)\$.+/;

    if (!bcryptRegex.test(hash) && !argon2Regex.test(hash)) {
      throw new Error(
        'Invalid password hash format. Must be a valid bcrypt or argon2 hash',
      );
    }

    return new PasswordHashVo(hash);
  }
}
