import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BadRequestException extends BaseException {
  constructor() {
    super('BAD_REQUEST', '잘못된 요청입니다.', HttpStatus.BAD_REQUEST);
  }
}
