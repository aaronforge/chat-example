import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { InternalServerErrorException } from '../exception/common.exception';
import { toErrorResponse } from 'src/util/filter.util';

@Catch()
export class WsAllExceptionFilter extends BaseWsExceptionFilter {
  private logger = new Logger(WsAllExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    const namespace = client.nsp.name;
    const hostArgs = host.getArgs();
    const lastArg = hostArgs.length > 0 ? hostArgs[hostArgs.length - 1] : null;
    const eventName = typeof lastArg === 'string' ? lastArg : 'unknown';
    const path = `${namespace}/${eventName}`;

    const placeholder = new InternalServerErrorException();
    let status = placeholder.getStatus();
    let raw: any | null = placeholder;
    const sub = client.data?.userId || 'anonymous';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      raw = exception.getResponse() as unknown;
    }
    const normalized = toErrorResponse(raw);

    this.logger.error(
      `[WS] | ${path} | ${status} | ${JSON.stringify(normalized)} | ${sub}`,
    );

    client.emit('error', {
      message: JSON.stringify({
        statusCode: status,
        code: normalized.code,
        message: normalized.message,
        timestamp: new Date().toISOString(),
        path,
      }),
    });
  }
}
