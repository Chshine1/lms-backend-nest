import { EntityProperty, Type } from '@mikro-orm/core';

export class InvitationCodeType extends Type<InvitationCodeVo, string> {
  override convertToDatabaseValue(vo: InvitationCodeVo): string {
    return vo.value;
  }

  override convertToJSValue(dbValue: string): InvitationCodeVo {
    return InvitationCodeVo.create(dbValue);
  }

  override getColumnType(prop: EntityProperty): string {
    return `varchar(${String(prop.length ?? 255)})`;
  }
}

export class InvitationCodeVo {
  private constructor(public readonly value: string) {}

  static create(code: string): InvitationCodeVo {
    const normalized = code.toUpperCase().trim();
    // Alphanumeric, exactly 8 characters
    const codeRegex = /^[A-Z0-9]{8}$/;

    if (!codeRegex.test(normalized)) {
      throw new Error(
        'Invalid invitation code format. Must be exactly 8 alphanumeric characters',
      );
    }

    return new InvitationCodeVo(normalized);
  }

  matches(input: string): boolean {
    return this.value === input.toUpperCase().trim();
  }
}
