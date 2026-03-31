import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class UserContextService {
  constructor(private readonly cls: ClsService) {}

  getRequiredUserId(): number {
    const userId = this.cls.get<number | undefined>('userId');
    if (userId === undefined) {
      throw new UnauthorizedException('No user ID in current context.');
    }
    return userId;
  }

  getUserId(): number | undefined {
    return this.cls.get<number | undefined>('userId');
  }
}
