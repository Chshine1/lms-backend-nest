import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseEnrollmentService {
  getHello(): string {
    return 'Hello World!';
  }
}
