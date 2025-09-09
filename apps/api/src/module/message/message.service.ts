import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from 'src/entity/message.entity';
import { Room } from 'src/entity/room.entity';
import { RoomMember } from 'src/entity/room-member.entity';
import {
  NotInRoomException,
  RoomNotFoundException,
} from 'src/common/exception/room.exception';
import { RoomMemberRepository } from 'src/repository/room-member.repository';
import { MessageRepository } from 'src/repository/message.repository';
import { ListMessageQuery } from './dto/list-message.dto';
import { MessageNotFoundException } from 'src/common/exception/message.exception';
import { ForbiddenException } from 'src/common/exception/common.exception';

@Injectable()
export class MessageService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomMemberRepository: RoomMemberRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  /**
   * 메시지 전송
   */
  async send(userId: string, dto: SendMessageDto) {
    const message = await this.dataSource.transaction(async (em) => {
      const messageRepo = em.getRepository(Message);
      const roomRepo = em.getRepository(Room);
      const memberRepo = em.getRepository(RoomMember);

      // 방 멤버 확인
      const member = await memberRepo.findOne({
        where: { roomId: dto.roomId, userId },
      });
      if (!member) throw new NotInRoomException();

      // 멱등성 확인
      const dup = await messageRepo.findOne({
        where: { roomId: dto.roomId, clientMsgId: dto.clientMsgId },
      });
      if (dup) return dup;

      // 방 존재 확인
      const room = await roomRepo.findOne({ where: { id: dto.roomId } });
      if (!room) throw new RoomNotFoundException();

      // lastSeq +1
      await roomRepo.update(
        { id: dto.roomId },
        { lastSeq: () => 'lastSeq + 1' },
      );

      const next = await roomRepo.findOne({ where: { id: dto.roomId } });
      const seq = next!.lastSeq;

      // 메시지 생성
      return messageRepo.save(
        messageRepo.create({
          roomId: dto.roomId,
          userId,
          type: dto.type,
          content: dto.content,
          clientMsgId: dto.clientMsgId,
          seq,
        }),
      );
    });

    return message;
  }

  /**
   * 메시지 목록 조회
   */
  async list(userId: string, dto: ListMessageQuery) {
    const { roomId, afterSeq, limit } = dto;

    const member = await this.roomMemberRepository.findOne({
      where: { roomId, userId },
    });
    if (!member) throw new NotInRoomException();

    const [list, total] = await this.messageRepository.listByRoomId(
      roomId,
      afterSeq,
      limit,
    );

    return { list, total };
  }

  /**
   * 메시지 삭제
   */
  async remove(userId: string, messageId: string) {
    const msg = await this.messageRepository.findOne({
      where: { id: messageId, userId },
    });

    console.log(messageId);

    if (!msg) throw new MessageNotFoundException();
    if (msg.userId !== userId) throw new ForbiddenException();

    console.log(messageId);

    await this.messageRepository.softDelete({ id: messageId });
    return true;
  }
}
