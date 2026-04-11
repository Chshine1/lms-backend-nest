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

  async catch(error: unknown, host: ArgumentsHost): Promise<unknown> {
    const normalizedError = this.normalizeError(error);

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
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      return response.status(errorResponse.statusCode).json(errorResponse);
    }
    if (host.getType() === 'rpc') {
      return {
        success: false,
        error: errorResponse,
      };
    }

    return errorResponse;
  }

  private normalizeError(error: unknown): BaseError {
    if (error instanceof BaseError) return error as BaseError;
    if (error instanceof ZodError) {
      const issues = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return new BadRequestError(issues);
    }
    return new UnknownError(error);
  }
}
