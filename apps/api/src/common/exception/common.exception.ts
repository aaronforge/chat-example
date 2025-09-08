import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BadRequestException extends BaseException {
  constructor(message = '잘못된 요청입니다.') {
    super('BAD_REQUEST', message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message = '인증되지 않은 사용자입니다.') {
    super('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }
}
