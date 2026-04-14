import { ArrayType } from '@mikro-orm/core';

export class BigintArrayType extends ArrayType<bigint> {
  constructor() {
    super(
      (dbValue: string) => BigInt(dbValue),
      (jsValue: bigint) => jsValue.toString(),
    );
  }
  override getColumnType(): string {
    return `bigint[]`;
  }
}
