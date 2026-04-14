import { ArrayType } from '@mikro-orm/core';

export class VarcharArrayType extends ArrayType {
  constructor(private readonly length: number) {
    super();
  }

  override getColumnType(): string {
    return `varchar(${String(this.length)})[]`;
  }
}
