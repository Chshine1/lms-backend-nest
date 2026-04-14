import { Controller } from '@nestjs/common';
import { CourseTypedClient, ExtractController } from '@app/typed-client';

@Controller()
export class CourseController implements ExtractController<CourseTypedClient> {
}
