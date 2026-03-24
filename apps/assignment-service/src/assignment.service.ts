import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignmentService {
  getHello(): string {
    return 'Hello World!';
  }
}
