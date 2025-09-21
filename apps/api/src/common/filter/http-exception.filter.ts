import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { toErrorResponse } from '@api/util/filter.util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const raw = exception.getResponse() as unknown;

    const normalized = toErrorResponse(raw);
    const sub = (request.user as any)?.sub;

    this.logger.error(
      `[${request.method}] | ${request.url} | ${status} | ${JSON.stringify(
        normalized,
      )} | ${sub || 'anonymous'}`,
    );

    response.status(status).json({
      statusCode: status,
      code: normalized.code,
      message: normalized.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
