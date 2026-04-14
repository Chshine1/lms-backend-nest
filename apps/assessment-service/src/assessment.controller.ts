import { Controller, Get } from '@nestjs/common';

@Controller()
export class AssessmentController {
  @Get()
  getHello(): string {
    return 'Hello';
  }
}
