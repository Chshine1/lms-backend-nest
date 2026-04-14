import { Injectable } from '@nestjs/common';
import { TypedClientBase } from '../typed-client.base';
import { AssessmentPatterns } from '../patterns/assessment.patterns';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { UserContextService } from '@app/authentication';

@Injectable()
export class AssessmentTypedClient extends TypedClientBase<AssessmentPatterns> {
  constructor(
    amqpConnection: AmqpConnection,
    userContextService: UserContextService,
    options: {
      exchange: string;
    },
  ) {
    super('assessment-service', amqpConnection, userContextService, options);
  }

  submit(
    data: AssessmentPatterns['submission.submit']['request'],
  ): Promise<AssessmentPatterns['submission.submit']['response']> {
    return this.rpc('submission.submit', data);
  }

  gradeSubmission(
    data: AssessmentPatterns['submission.grade']['request'],
  ): Promise<AssessmentPatterns['submission.grade']['response']> {
    return this.rpc('submission.grade', data);
  }
}
