import { Injectable } from '@nestjs/common';
import { NotInRoomException } from '@api/common/exception/room.exception';
import { RoomMemberRepository } from '@api/repository/room-member.repository';
import { MessageRepository } from '@api/repository/message.repository';
import { ListMessageQuery } from './dto/list-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly roomMemberRepository: RoomMemberRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  /**
   * 메시지 목록 조회
   */
  async list(userId: string, dto: ListMessageQuery) {
    const { roomId, beforeSeq: afterSeq, limit } = dto;

    const member = await this.roomMemberRepository.findOne({
      where: { roomId, userId },
    });
    if (!member) throw new NotInRoomException();

    const [list, total] = await this.messageRepository.listByRoomId(
      roomId,
      afterSeq,
      limit,
    );

    const nextCursor = list.length ? list[list.length - 1].seq : null;

    return { list: list.reverse(), total, nextCursor };
  }
}
