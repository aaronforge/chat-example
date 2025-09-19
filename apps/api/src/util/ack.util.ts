import {
  BaseException,
  ExceptionResponseDto,
} from 'src/common/exception/base.exception';
import { toErrorResponse } from './filter.util';

export type AckOk<T extends Object = {}> = { ok: true } & T;

export const ackOk = <T extends Object = {}>(data?: T): AckOk<T> => {
  return { ok: true, ...(data || ({} as T)) };
};

export const ackFail = (
  exception: BaseException,
  namespace: string,
  eventName: string,
): ExceptionResponseDto => {
  const status = exception.getStatus();
  const raw = exception.getResponse() as unknown;
  const normalized = toErrorResponse(raw);

  return {
    statusCode: status,
    code: exception.code,
    message: normalized.message,
    timestamp: new Date(),
    path: namespace,
    eventName,
  };
};
