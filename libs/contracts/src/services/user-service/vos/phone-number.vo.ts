import { EntityProperty, Type } from '@mikro-orm/core';

export class PhoneNumberType extends Type<PhoneNumberVo, string> {
  override convertToDatabaseValue(vo: PhoneNumberVo): string {
    return vo.value;
  }

  override convertToJSValue(dbValue: string): PhoneNumberVo {
    return PhoneNumberVo.create(dbValue);
  }

  override getColumnType(prop: EntityProperty): string {
    return `varchar(${String(prop.length ?? 255)})`;
  }
}

export class PhoneNumberVo {
  private constructor(public readonly value: string) {}

  static create(phoneNumber: string): PhoneNumberVo {
    const normalized = phoneNumber.trim();
    // E.164 format validation: +[country code][number] (max 15 digits)
    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (!e164Regex.test(normalized)) {
      throw new Error(
        'Invalid phone number format. Must conform to E.164 format (e.g., +1234567890)',
      );
    }

    return new PhoneNumberVo(normalized);
  }
}
