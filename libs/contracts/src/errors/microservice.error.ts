import { BaseError, ErrorResponse } from './base-error';
import { ErrorCode } from './error.codes';

export class MicroserviceError extends BaseError<{
  serviceName: string;
  domainCode: string;
  message: string;
  serviceErrorTime: Date;
}> {
  constructor(serviceName: string, errorResponse: ErrorResponse) {
    super(
      `Service ${serviceName} throws an error ${errorResponse.domainCode}: ${errorResponse.message}`,
      ErrorCode.MICROSERVICE,
      {
        serviceName: serviceName,
        domainCode: errorResponse.domainCode,
        message: errorResponse.message,
        serviceErrorTime: errorResponse.timestamp,
      },
    );
  }
}
