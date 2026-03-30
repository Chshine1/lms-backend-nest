import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class UserContextService {
  constructor(private readonly cls: ClsService) {}

  getUserId(): number {
    const userId = this.cls.get<number>('userId');
    if (!userId) {
      throw new Error(
        'No user ID in current context. Make sure RabbitMQPermissionGuard is applied.',
      );
    }
    return userId;
  }
}
