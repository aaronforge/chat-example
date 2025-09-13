import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotInRoomException extends BaseException {
  constructor() {
    super('NOT_IN_ROOM', '해당 방의 멤버가 아닙니다.', HttpStatus.NOT_FOUND);
  }
}

export class RoomNotFoundException extends BaseException {
  constructor() {
    super(
      'ROOM_NOT_FOUND',
      '채팅방 정보를 찾을 수 없습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class NeedAtLeastTwoMembersException extends BaseException {
  constructor() {
    super(
      'NEED_AT_LEAST_TWO_MEMBERS',
      '최소 2명 이상의 멤버가 있어야 합니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
