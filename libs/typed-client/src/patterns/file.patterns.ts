import { FileContract } from '@app/contracts/file/entities/file.contract';
import { CreateFileDto } from '@app/contracts/file/dto/create-file.dto';
import { SignedUrlResult } from '@app/contracts/file/dto/signed-url.result';

export interface FilePatterns extends Record<
  string,
  { request: unknown; response: unknown }
> {
  'file.create': {
    request: CreateFileDto;
    response: FileContract;
  };
  'file.getById': {
    request: { id: number };
    response: FileContract;
  };
  'file.delete': {
    request: { id: number; userId: number };
    response: void;
  };
  'file.getSignedUrl': {
    request: { id: number; expiresIn?: number };
    response: SignedUrlResult;
  };
}
