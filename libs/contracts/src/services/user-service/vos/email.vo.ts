import { Type, EntityProperty } from '@mikro-orm/core';

export class EmailType extends Type<EmailVo, string> {
  override convertToDatabaseValue(vo: EmailVo): string {
    return vo.value;
  }

  override convertToJSValue(dbValue: string): EmailVo {
    return EmailVo.create(dbValue);
  }

  override getColumnType(prop: EntityProperty): string {
    return `varchar(${String(prop.length ?? 255)})`;
  }
}

export class EmailVo {
  private constructor(public readonly value: string) {}

  static create(email: string): EmailVo {
    const normalized = email.toLowerCase().trim();
    // RFC 5322 compliant email validation
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // TODO: Rich error handling required
    if (!emailRegex.test(normalized)) {
      throw new Error('Invalid email format');
    }

    return new EmailVo(normalized);
  }
}
