import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseSchedulingService {
  getHello(): string {
    return 'Hello World!';
  }
}
