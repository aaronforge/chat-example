import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ExpiredTokenException extends BaseException {
  constructor() {
    super('EXPIRED_TOKEN', '만료된 인증 정보입니다.', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenException extends BaseException {
  constructor() {
    super('INVALID_TOKEN', '잘못된 인증 정보입니다.', HttpStatus.UNAUTHORIZED);
  }
}

export class SubjectNotFoundException extends BaseException {
  constructor() {
    super(
      'SUBJECT_NOT_FOUND',
      '사용자를 찾을 수 없습니다.',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class RefreshFailedException extends BaseException {
  constructor() {
    super('REFRESH_FAILED', '잘못된 인증 정보입니다.', HttpStatus.UNAUTHORIZED);
  }
}
