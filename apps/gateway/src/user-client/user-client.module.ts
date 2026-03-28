import { Module } from '@nestjs/common';
import { TypedClientModule, UserTypedClient } from '@app/typed-client';

@Module({
  imports: [
    TypedClientModule.forFeature({
      mqOptions: {
        exchange: 'user-service',
      },
      clients: [UserTypedClient],
    }),
  ],
  exports: [TypedClientModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserClientModule {}
