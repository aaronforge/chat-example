import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  error?: unknown;
  statusCode?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toErrorResponse(res: unknown): { code: string; message: string } {
  // 문자열 메시지인 경우
  if (typeof res === 'string') {
    return { code: 'INTERNAL_ERROR', message: res };
  }

  // 객체 모양인 경우 (Nest의 기본 HttpException 응답 등)
  if (isRecord(res)) {
    const obj = res as ErrorLike;

    // code
    const code = typeof obj.code === 'string' ? obj.code : 'ERROR';

    // message (string | string[] | 기타)
    if (typeof obj.message === 'string') {
      return { code, message: obj.message };
    }
    if (
      Array.isArray(obj.message) &&
      obj.message.every((m) => typeof m === 'string')
    ) {
      return { code, message: obj.message.join(', ') };
    }

    // Nest 기본 필드 fallback
    if (typeof obj.error === 'string') {
      return { code, message: obj.error };
    }
  }

  // 그 외 알 수 없는 형태
  return { code: 'ERROR', message: 'Unexpected error' };
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const raw = exception.getResponse() as unknown;

    const normalized = toErrorResponse(raw);

    response.status(status).json({
      statusCode: status,
      code: normalized.code,
      message: normalized.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
