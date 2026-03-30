import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { FilePatterns } from '../patterns/file.patterns';

@Injectable()
export class FileTypedClient extends TypedClientBase<FilePatterns> {
  validateFileExists(ids: number[]): Promise<boolean[]> {
    return this.rpc('file.validateExists', ids);
  }
}
