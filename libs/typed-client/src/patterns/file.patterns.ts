import { CreateFileDto, FileContract, SignedUrlResult } from '@app/contracts';

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
    response: never;
  };
  'file.getSignedUrl': {
    request: { id: number; expiresIn?: number };
    response: SignedUrlResult;
  };
}
