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

export class UserNotFoundException extends BaseException {
  constructor() {
    super('USER_NOT_FOUND', '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}

export class InvalidCredentialsException extends BaseException {
  constructor() {
    super(
      'INVALID_CREDENTIALS',
      '이메일 또는 비밀번호가 올바르지 않습니다.',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
