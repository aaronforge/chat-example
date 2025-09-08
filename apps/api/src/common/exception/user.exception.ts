import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class EmailExistsException extends BaseException {
  constructor() {
    super(
      'EMAIL_ALREADY_EXISTS',
      '해당 이메일은 이미 사용 중입니다.',
      HttpStatus.CONFLICT,
    );
  }
}
