import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './providers/local-storage.provider';

export const STORAGE_TOKEN = 'STORAGE_TOKEN';

@Module({
  providers: [
    {
      provide: STORAGE_TOKEN,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [STORAGE_TOKEN],
})
export class StorageModule {}
