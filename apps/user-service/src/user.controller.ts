import { Controller } from '@nestjs/common';
import { ExtractController, UserTypedClient } from '@app/typed-client';

@Controller()
export class UserController implements ExtractController<UserTypedClient> {

}
