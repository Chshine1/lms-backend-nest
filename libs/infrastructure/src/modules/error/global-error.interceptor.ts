import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { ZodError } from 'zod';
import { LoggerService } from '../logger/logger.service';
import {
  BadRequestError,
  BaseError,
  ErrorResponse,
  LogLevel,
  UnknownError,
} from '@app/contracts';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly errorToLogLevelMap: Record<string, LogLevel>,
  ) {}

  async catch(error: unknown, host: ArgumentsHost): Promise<void> {
    let normalizedError: BaseError;

    if (error instanceof BaseError) normalizedError = error as BaseError;
    else if (error instanceof ZodError) {
      normalizedError = this.normalizeZodError(error);
    } else {
      normalizedError = new UnknownError(error);
    }

    const errorCode = normalizedError.code;
    const logLevel = this.errorToLogLevelMap[errorCode] || LogLevel.ERROR;

    await this.loggerService.log({
      level: logLevel,
      message: normalizedError.message,
      context: {
        errorCode,
        ...normalizedError.context,
      },
    });
    await this.loggerService.flush();

    const errorResponse: ErrorResponse = normalizedError.toErrorResponse();
    if (host.getType() === 'http') {
      host
        .switchToHttp()
        .getResponse<Response>()
        .status(errorResponse.statusCode)
        .json(errorResponse);
    }
  }

  private normalizeZodError(zodError: ZodError): BadRequestError {
    const issues = zodError.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return new BadRequestError(issues);
  }
}
