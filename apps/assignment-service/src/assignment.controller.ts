import { Controller, Get } from '@nestjs/common';
import { AssignmentService } from './assignment.service';

@Controller()
export class AssignmentController {
  constructor(private readonly assignmentServiceService: AssignmentService) {}

  @Get()
  getHello(): string {
    return this.assignmentServiceService.getHello();
  }
}
