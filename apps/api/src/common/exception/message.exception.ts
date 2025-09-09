import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class MessageNotFoundException extends BaseException {
  constructor() {
    super(
      'MESSAGE_NOT_FOUND',
      '메시지를 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}
