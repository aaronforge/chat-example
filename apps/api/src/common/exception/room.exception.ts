import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotInRoomException extends BaseException {
  constructor() {
    super('NOT_FOUND', '해당 방의 멤버가 아닙니다.', HttpStatus.NOT_FOUND);
  }
}
